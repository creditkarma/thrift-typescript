import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
let thriftParser = require('thrift-parser')
import { compile } from 'handlebars'
import { registerHelpers } from './ts-helpers'
import {
  toAstType,
  toOptional,
  createIf,
  createThrow,
  createVariable,
  createNotEquals
} from './ast-helpers'
import * as gen from './ast-specifics'

function readFile(fileName: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function getStructs(idl: any) {
  const keys = idl.struct || []
  return Object.keys(keys).map(key => ({
    fields: idl.struct[key],
    name: key,
  }))
}

async function generateTypes(types: any) {
  const template: HandlebarsTemplateDelegate = await loadTemplate('types.hbs')
  return template(types)
}

function getServices(idl: any) {
  return Object.keys(idl.service).map(key => ({
    methods: idl.service[key],
    name: key,
  }))
}

async function generateServices(services: any) {
  const template: HandlebarsTemplateDelegate = await loadTemplate('services.hbs')
  return template(services)
}

export async function loadTemplate(fileName: string): Promise<HandlebarsTemplateDelegate> {
  const fullPath = path.join(__dirname, `../templates/${fileName}`)
  const src = await readFile(fullPath)
  return compile(src)
}

export function parseFile(fileName: string): Promise<any> {
  return readFile(fileName).then(idl => {
    return thriftParser(idl)
  })
}

export async function generateIDLTypes(fileName: string): Promise<string> {
  registerHelpers()
  const idl = await parseFile(fileName)
  const structs = getStructs(idl)
  return generateTypes(structs)
}

export async function generateIDLServices(fileName: string): Promise<string> {
  registerHelpers()
  const idl = await parseFile(fileName)
  let upcaseFile = path.basename(fileName).split('.thrift')[0]
  upcaseFile = upcaseFile[0].toUpperCase() + upcaseFile.substr(1)
  const input = {
    fileName: upcaseFile,
    services: getServices(idl),
    structs: getStructs(idl),
  }
  return generateServices(input)
}

function createConstructor(fields) {
  // filter map/list/set for now
  fields = fields.filter((field) => typeof field.type !== 'object');

  const _questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);

  const _args = ts.createIdentifier('args');
  const _Thrift = ts.createIdentifier('Thrift');

  const _argsParameter = ts.createParameter(undefined, undefined, undefined, _args, _questionToken, undefined, undefined);

  const _fieldAssignments = fields.map(function(field) {
    const _argsPropAccess = ts.createPropertyAccess(_args, field.name);
    const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);
    const _propertyAssignment = ts.createAssignment(_thisPropAccess, _argsPropAccess);
    const _thenAssign = ts.createStatement(_propertyAssignment)

    const _comparison = createNotEquals(_argsPropAccess, ts.createNull());

    let _elseThrow;
    if (field.option === 'required') {
      const _errCtor = ts.createPropertyAccess(_Thrift, 'TProtocolException');
      const _errType = ts.createPropertyAccess(_Thrift, 'TProtocolExceptionType.UNKNOWN')
      const _errArgs = [_errType, ts.createLiteral(`Required field ${field.name} is unset!`)];
      _elseThrow = createThrow(_errCtor, _errArgs);
    }

    return createIf(_comparison, _thenAssign, _elseThrow);
  })

  const _ifArgs = createIf(_args, _fieldAssignments);

  const _constructorBlock = ts.createBlock([_ifArgs], true);

  return ts.createConstructor(undefined, undefined, [_argsParameter], _constructorBlock);
}

function createRead(fields) {
  // filter map/list/set for now
  fields = fields.filter((field) => typeof field.type !== 'object');

  const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);

  const _Thrift = ts.createIdentifier('Thrift');
  const _input = ts.createIdentifier('input');
  const _ret = ts.createIdentifier('ret');
  const _fname = ts.createIdentifier('fname')
  const _ftype = ts.createIdentifier('ftype');
  const _fid = ts.createIdentifier('fid');

  const _readStructBegin = gen.readStructBegin();
  const _readFieldBegin = gen.readFieldBegin();

  const _retFname = ts.createPropertyAccess(_ret, 'fname');
  const _fnameConst = createVariable(_fname, _retFname);

  const _retFtype = ts.createPropertyAccess(_ret, 'ftype');
  const _ftypeConst = createVariable(_ftype, _retFtype)

  const _retFid = ts.createPropertyAccess(_ret, 'fid');
  const _fidConst = createVariable(_fid, _retFid);

  const _typeStopAccess = ts.createPropertyAccess(_Thrift, 'Type.STOP');
  const _comparison = ts.createStrictEquality(_ftype, _typeStopAccess);

  const _ifStop = createIf(_comparison, ts.createBreak());

  const _cases = fields.map(function(field) {
    const type = field.type[0].toUpperCase() + field.type.slice(1);

    const _typeAccess = ts.createPropertyAccess(_Thrift, `Type.${type}`);
    const _comparison = ts.createStrictEquality(_ftype, _typeAccess);

    const _thisName = ts.createPropertyAccess(ts.createThis(), field.name);
    const _readType = ts.createPropertyAccess(_input, `read${type}`);
    const _readTypeCall = ts.createCall(_readType, undefined, undefined);
    const _readAssignment = ts.createAssignment(_thisName, _readTypeCall);
    const _readStatement = ts.createStatement(_readAssignment);

    const _skip = gen.skip();

    const _break = ts.createBreak();

    const _ifType = createIf(_comparison, _readStatement, _skip);

    return ts.createCaseClause(ts.createLiteral(field.id), [
      ts.createBlock([_ifType, _break], true)
    ]);
  });

  const _skip = gen.skip();
  const _skipBlock = ts.createBlock([_skip], true);

  const _default = ts.createDefaultClause([_skipBlock])
  const _caseBlock = ts.createCaseBlock([
    ..._cases,
    _default
  ]);
  const _switch = ts.createSwitch(_fid, _caseBlock);

  const _readFieldEnd = gen.readFieldEnd()

  const _whileBody = ts.createBlock([
    _readFieldBegin,
    _fnameConst,
    _ftypeConst,
    _fidConst,
    _ifStop,
    _switch,
    _readFieldEnd
  ], true);

  const _while = ts.createWhile(ts.createTrue(), _whileBody);

  const _readStructEnd = gen.readStructEnd();

  const _readBlock = ts.createBlock([
    _readStructBegin,
    _while,
    _readStructEnd
  ], true);

  const _inputDeclaration = ts.createParameter(undefined, undefined, undefined, _input, undefined, undefined, undefined);
  return ts.createMethodDeclaration(undefined, [_publicModifier], undefined, 'read', undefined, undefined, [_inputDeclaration], undefined, _readBlock);
}

function getType(typedef: string | { name: string, keyType?: string, valueType: string}) : string {
  if (typeof typedef === 'string') {
    return typedef;
  }
  return typedef.name;
}

function createSetBody(_thisPropAccess, _innerType) {
  // output.writeSetBegin(Thrift.Type.STRING, this.hmm2.length);
  console.log(_innerType);
  const innerType = _innerType[0].toUpperCase() + _innerType.slice(1);
  const _writeSetBegin = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeSetBegin');
  const _writeSetBeginCall = ts.createCall(_writeSetBegin, undefined, [
    ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${innerType.toUpperCase()}`),
    ts.createPropertyAccess(_thisPropAccess, 'length')
  ]);
  const _writeSetBeginStatement = ts.createStatement(_writeSetBeginCall);

  // for (var iter46 in this.hmm2) {

  // TODO: set is stored in an array, maybe this should be a for loop instead
  const _loopTmp = ts.createLoopVariable();
  const _key = ts.createVariableDeclarationList([
    ts.createVariableDeclaration(_loopTmp)
  ]);
  //   if (this.hmm2.hasOwnProperty(iter46))
  const _hasOwnProp = ts.createPropertyAccess(_thisPropAccess, 'hasOwnProperty');
  const _hasOwnPropCall = ts.createCall(_hasOwnProp, undefined, [
    _loopTmp
  ]);
  // TODO: duplicate code? Uses elementAccess instead
  // output.writeString(this.hmm2[iter46]);
  const _writeType = ts.createPropertyAccess(ts.createIdentifier('output'), `write${innerType}`);
  const _writeTypeCall = ts.createCall(_writeType, undefined, [
    ts.createElementAccess(_thisPropAccess, _loopTmp)
  ]);
  const _writeTypeStatement = ts.createStatement(_writeTypeCall)
  // End duplicate
  const _ifHasOwnProp = ts.createIf(_hasOwnPropCall, _writeTypeStatement);
  const _writeBlock = ts.createBlock([
    _ifHasOwnProp
  ]);
  const _forIn = ts.createForIn(_key, _thisPropAccess, _writeBlock);


  // output.writeSetEnd();
  const _writeSetEnd = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeSetEnd');
  const _writeSetEndCall = ts.createCall(_writeSetEnd, undefined, undefined);
  const _writeSetEndStatement = ts.createStatement(_writeSetEndCall);

  return [
    _writeSetBeginStatement,
    _forIn,
    _writeSetEndStatement
  ];
}

function createWriteField(field) {
  let type;
  if (typeof field.type === 'object') {
    type = field.type.name[0].toUpperCase() + field.type.name.slice(1);
  } else {
    type = field.type[0].toUpperCase() + field.type.slice(1);
  }
  const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);
  const _comparison = createNotEquals(_thisPropAccess, ts.createNull());

  const _writeFieldBegin = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeFieldBegin');
  const _writeFieldBeginCall = ts.createCall(_writeFieldBegin, undefined, [
    ts.createLiteral(field.name),
    ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${type.toUpperCase()}`),
    ts.createLiteral(field.id)
  ]);
  const _writeFieldBeginStatement = ts.createStatement(_writeFieldBeginCall);

  // TODO: rename variable
  let _writeTypeStatement;
  switch(getType(field.type)) {
    case 'set': {
      _writeTypeStatement = createSetBody(_thisPropAccess, field.type.valueType);
      break;
    }
    case 'list':
      break;
    case 'map':
      break;
    default:
      const _writeType = ts.createPropertyAccess(ts.createIdentifier('output'), `write${type}`);
      const _writeTypeCall = ts.createCall(_writeType, undefined, [
        ts.createPropertyAccess(ts.createThis(), field.name)
      ]);
      // TODO: has to be an array to work with containers and spread?
      _writeTypeStatement = [
        ts.createStatement(_writeTypeCall)
      ];
      break;
  }

  const _writeFieldEnd = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeFieldEnd');
  const _writeFieldEndCall = ts.createCall(_writeFieldEnd, undefined, undefined);
  const _writeFieldEndStatement = ts.createStatement(_writeFieldEndCall);

  const _if = ts.createIf(_comparison, ts.createBlock([
    _writeFieldBeginStatement,
    ..._writeTypeStatement,
    _writeFieldEndStatement
  ]));

  return _if;
}

function createWrite(service) {
  const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);

  const _writeStructBegin = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeStructBegin');
  const _writeStructBeginCall = ts.createCall(_writeStructBegin, undefined, [ts.createLiteral(`${service.name}`)]);
  const _writeStructBeginStatement = ts.createStatement(_writeStructBeginCall);

  const _writeFields = service.fields.map(createWriteField);

  const _writeFieldStop = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeFieldStop');
  const _writeFieldStopCall = ts.createCall(_writeFieldStop, undefined, undefined);
  const _writeFieldStopStatement = ts.createStatement(_writeFieldStopCall);

  const _writeStructEnd = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeStructEnd');
  const _writeStructEndCall = ts.createCall(_writeStructEnd, undefined, undefined);
  const _writeStructEndStatement = ts.createStatement(_writeStructEndCall);

  const _writeBlock = ts.createBlock([
    _writeStructBeginStatement,
    ..._writeFields,
    _writeFieldStopStatement,
    _writeStructEndStatement
  ], true);

  const _outputDeclaration = ts.createParameter(undefined, undefined, undefined, 'output', undefined, undefined, undefined);
  return ts.createMethodDeclaration(undefined, [_publicModifier], undefined, 'write', undefined, undefined, [_outputDeclaration], undefined, _writeBlock);
}

function generateServicesAST(services: any[]): string {
  // TODO: bundle maybe?
  let src = ts.createSourceFile('output.ts', '', ts.ScriptTarget.ES5, false, ts.ScriptKind.TS);

  services.forEach(function(service) {
    const _exportModifier = ts.createToken(ts.SyntaxKind.ExportKeyword);
    const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);

    const _fieldDeclarations = service.fields.map(function(field) {

      let _type = toAstType(field.type);
      let _optional = toOptional(field.option);

      let _default;
      if (field.defaultValue != null) {
        _default = ts.createLiteral(field.defaultValue);
      } else {
        _default = ts.createNull();
      }

      return ts.createProperty(undefined, [_publicModifier], field.name, _optional, _type, _default);
    });

    const _successDeclaration = ts.createProperty(undefined, [_publicModifier], 'success', undefined, toAstType('bool'), undefined);

    // Build the constructor body
    const _constructor = createConstructor(service.fields);

    // Build the `read` method
    const _read = createRead(service.fields);

    // Build the `write` method
    const _write = createWrite(service);

    const _classExpression = ts.createClassExpression([_exportModifier], service.name, [], [], [
      _successDeclaration,
      ..._fieldDeclarations,
      _constructor,
      _read,
      _write
    ]);

    const _classStatement = ts.createStatement(_classExpression);

    let _require = ts.createImportEqualsDeclaration(undefined, undefined, 'thrift', ts.createExternalModuleReference(ts.createLiteral('thrift')));
    const _namespaceThrift = ts.createImportEqualsDeclaration(undefined, undefined, 'Thrift', ts.createIdentifier('thrift.Thrift'));
    const _namespaceQ = ts.createImportEqualsDeclaration(undefined, undefined, 'Q', ts.createIdentifier('thrift.Q'));

    _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, '', false);
    _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, ' Autogenerated by thrift-typescript', false);
    _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, '', false);
    _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, ' DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING', false);
    _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, '', true);

    src = ts.updateSourceFileNode(src, [
      _require,
      _namespaceThrift,
      _namespaceQ,
      _classStatement
    ]);
  });


  const printer = ts.createPrinter();

  return printer.printFile(src);
}

export async function generateIDLTypesAST(filename: string): Promise<string> {
  registerHelpers();
  const idl = await parseFile(filename);
  const structs = getStructs(idl);
  return generateServicesAST(structs);
}
