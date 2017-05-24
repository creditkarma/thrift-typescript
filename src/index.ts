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
  createNotEquals,
  getEnumType,
  getType
} from './ast-helpers'
import * as gen from './ast-specifics'

import { getReadBody } from './read-types';
import { getWriteBody } from './write-types';

import {
  getStructs,
  getServices,
  getTypeDefs
} from './get';

import {
  resolveStructs,
  resolveTypes
} from './resolve';
import {
  validateTypes
} from './validate';

import {
  identifiers as _id
} from './ast/identifiers';
import {
  types as _types
} from './ast/thrift-types';

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

async function generateTypes(types: any) {
  const template: HandlebarsTemplateDelegate = await loadTemplate('types.hbs')
  return template(types)
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

function createAssignment(left, right) {
  const _propertyAssignment = ts.createAssignment(left, right);

  return ts.createStatement(_propertyAssignment);
}

function createConstructor(fields) {
  const _questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);

  const _argsParameter = ts.createParameter(undefined, undefined, undefined, _id.args, _questionToken, undefined, undefined);

  const _fieldAssignments = fields.map(function(field) {

    const _argsPropAccess = ts.createPropertyAccess(_id.args, field.name);
    const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);

    // Map is supposed to use Thrift.copyMap but that doesn't work if we use something better than an object
    // Set/List is supposed to use Thrift.copyList but the implementation is weird and might not work when combined with the custom Map copying
    // TODO: should we perform a deep clone? Currently shallow but not sure if deep cloning is actually needed
    let _thenAssign;
    switch(getType(field.type)) {
      case 'set': {
        // TODO: without some sort of recursion/deep-clone, a Set inside a Map/Set/List won't be a true Set but forEach should operate the same way
        // However, it wouldn't ensure unique values
        const _copy = ts.createNew(_id.Set, undefined, [
          _argsPropAccess
        ]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'list': {
        const _copy = ts.createCall(ts.createPropertyAccess(_id.Array, 'from'), undefined, [
          _argsPropAccess
        ]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'map': {
        // TODO: without some sort of recursion/deep-clone, a Map inside a Map/Set/List won't be a true Map which would screw up our forEach
        const _copy = ts.createNew(_id.Map, undefined, [
          _argsPropAccess
        ]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'struct': {
        const _new = ts.createNew(ts.createIdentifier(field.tsType), undefined, [
          _argsPropAccess
        ]);
        _thenAssign = createAssignment(_thisPropAccess, _new);
        break;
      }
      case 'bool': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'i32': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'i16': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'string': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'binary': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'double': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'i64': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'byte': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      // The thrift binary warns to use i8 but then spits out writeByte
      case 'i8': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      // TODO: probably need to handle other type aliases OR the validator/normalize phase can output these
      default:
        // TODO: custom types
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        // throw new Error('Not Implemented ' + field.type)
    }

    const _comparison = createNotEquals(_argsPropAccess, ts.createNull());

    let _elseThrow;
    if (field.option === 'required') {
      const _errCtor = ts.createPropertyAccess(_id.Thrift, 'TProtocolException');
      const _errType = ts.createPropertyAccess(_id.Thrift, 'TProtocolExceptionType.UNKNOWN')
      const _errArgs = [_errType, ts.createLiteral(`Required field ${field.name} is unset!`)];
      _elseThrow = createThrow(_errCtor, _errArgs);
    }

    return createIf(_comparison, _thenAssign, _elseThrow);
  })

  const _ifArgs = createIf(_id.args, _fieldAssignments);

  const _constructorBlock = ts.createBlock([_ifArgs], true);

  return ts.createConstructor(undefined, undefined, [_argsParameter], _constructorBlock);
}

function createReadField(field) {

  const _enumType = getEnumType(field.type);

  const _comparison = ts.createStrictEquality(_id.ftype, _types[_enumType]);

  const _thisName = ts.createPropertyAccess(ts.createThis(), field.name);
  const _readAndAssign = getReadBody(field.type, _thisName);

  const _skip = gen.skip();

  const _break = ts.createBreak();

  const _ifType = createIf(_comparison, _readAndAssign, _skip);

  return ts.createCaseClause(ts.createLiteral(field.id), [
    ts.createBlock([_ifType, _break], true)
  ]);
}

function createRead(fields) {
  const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);

  const _readStructBegin = gen.readStructBegin();
  const _readFieldBegin = gen.readFieldBegin();

  const _retFname = ts.createPropertyAccess(_id.ret, _id.fname);
  const _fnameConst = createVariable(_id.fname, _retFname);

  const _retFtype = ts.createPropertyAccess(_id.ret, _id.ftype);
  const _ftypeConst = createVariable(_id.ftype, _retFtype)

  const _retFid = ts.createPropertyAccess(_id.ret, _id.fid);
  const _fidConst = createVariable(_id.fid, _retFid);

  const _comparison = ts.createStrictEquality(_id.ftype, _types.STOP);

  const _ifStop = createIf(_comparison, ts.createBreak());

  const _cases = fields.map(createReadField);

  const _skip = gen.skip();
  const _skipBlock = ts.createBlock([_skip], true);

  const _default = ts.createDefaultClause([_skipBlock])
  const _caseBlock = ts.createCaseBlock([
    ..._cases,
    _default
  ]);
  const _switch = ts.createSwitch(_id.fid, _caseBlock);

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

  const _inputDeclaration = ts.createParameter(undefined, undefined, undefined, _id.input, undefined, undefined, undefined);
  return ts.createMethod(undefined, [_publicModifier], undefined, _id.read, undefined, undefined, [_inputDeclaration], undefined, _readBlock);
}




function createWriteField(field) {
  const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);

  const _comparison = createNotEquals(_thisPropAccess, ts.createNull());

  const _enumType = getEnumType(field.type);

  let body = getWriteBody(field.type, _thisPropAccess);

  if (!Array.isArray(body)) {
    body = [body];
  }

  const _if = ts.createIf(_comparison, ts.createBlock([
    gen.writeFieldBegin(field.name, _enumType, field.id),
    ...body,
    gen.writeFieldEnd(),
  ]))

  return _if;
}

function createWrite(service) {
  const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);

  const _writeStructBegin = ts.createPropertyAccess(_id.output, 'writeStructBegin');
  const _writeStructBeginCall = ts.createCall(_writeStructBegin, undefined, [ts.createLiteral(`${service.name}`)]);
  const _writeStructBeginStatement = ts.createStatement(_writeStructBeginCall);

  const _writeFields = service.fields.map(createWriteField);

  const _writeFieldStop = ts.createPropertyAccess(_id.output, 'writeFieldStop');
  const _writeFieldStopCall = ts.createCall(_writeFieldStop, undefined, undefined);
  const _writeFieldStopStatement = ts.createStatement(_writeFieldStopCall);

  const _writeStructEnd = ts.createPropertyAccess(_id.output, 'writeStructEnd');
  const _writeStructEndCall = ts.createCall(_writeStructEnd, undefined, undefined);
  const _writeStructEndStatement = ts.createStatement(_writeStructEndCall);

  const _writeBlock = ts.createBlock([
    _writeStructBeginStatement,
    ..._writeFields,
    _writeFieldStopStatement,
    _writeStructEndStatement
  ], true);

  const _outputDeclaration = ts.createParameter(undefined, undefined, undefined, _id.output, undefined, undefined, undefined);
  return ts.createMethod(undefined, [_publicModifier], undefined, _id.write, undefined, undefined, [_outputDeclaration], undefined, _writeBlock);
}

function generateTypesAST(idl: any): string {
  const typedefs = getTypeDefs(idl);
  const structs = getStructs(idl);

  const _exportModifier = ts.createToken(ts.SyntaxKind.ExportKeyword);

  let prefaceFile = ts.createSourceFile('preface.ts', '', ts.ScriptTarget.ES5, false, ts.ScriptKind.TS);

  const _thriftImport = ts.createImportClause(undefined, ts.createNamedImports([
    ts.createImportSpecifier(undefined, _id.Thrift)
  ]));
  let _require = ts.createImportDeclaration(undefined, undefined, _thriftImport, ts.createLiteral('thrift'));

  _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, '', false);
  _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, ' Autogenerated by thrift-typescript', false);
  _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, '', false);
  _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, ' DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING', false);
  _require = ts.addSyntheticLeadingComment(_require, ts.SyntaxKind.SingleLineCommentTrivia, '', true);

  prefaceFile = ts.updateSourceFileNode(prefaceFile, [
    _require
  ]);

  const _types = typedefs.map(function(typedef) {
    const _type = ts.createTypeAliasDeclaration(undefined, [_exportModifier], typedef.name, undefined, toAstType(typedef.type));

    return _type;
  });

  const _structs = structs.map(function(struct) {

    const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);

    const _fieldDeclarations = struct.fields.map(function(field) {

      // TODO: have this resolved or something?
      let _type = toAstType(field.tsType);
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
    const _constructor = createConstructor(struct.fields);

    // Build the `read` method
    const _read = createRead(struct.fields);

    // Build the `write` method
    const _write = createWrite(struct);

    const _classExpression = ts.createClassExpression([_exportModifier], struct.name, [], [], [
      _successDeclaration,
      ..._fieldDeclarations,
      _constructor,
      _read,
      _write
    ]);

    const _classStatement = ts.createStatement(_classExpression);

    return _classStatement;
  });

  let bodyFile = ts.createSourceFile('body.ts', '', ts.ScriptTarget.ES5, false, ts.ScriptKind.TS);
  if (idl.namespace && idl.namespace.js) {

    const namespace = ts.createIdentifier(idl.namespace.js.serviceName);

    const _namespaceBlock = ts.createModuleBlock([
      ..._types,
      ..._structs
    ]);

    const _namespace = ts.createModuleDeclaration(undefined, [_exportModifier], namespace, _namespaceBlock, ts.NodeFlags.Namespace);
    bodyFile = ts.updateSourceFileNode(bodyFile, [
      _namespace
    ]);
  } else {
    bodyFile = ts.updateSourceFileNode(bodyFile, [
      ..._types,
      ..._structs
    ]);
  }

  const printer = ts.createPrinter();

  return printer.printBundle(ts.createBundle([
    prefaceFile,
    bodyFile
  ]));
}


export async function generateIDLTypesAST(filename: string): Promise<string> {
  registerHelpers();
  let idl = await parseFile(filename);

  // Mutation
  resolveTypes(idl);
  validateTypes(idl);

  resolveStructs(idl);

  return generateTypesAST(idl);
}
