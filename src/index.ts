import * as ts from 'typescript'
const thriftParser = require('thrift-parser');

import readFile from './filesystem/read-file';

import {
  toAstType,
  toOptional,
  createIf,
  createThrow,
  createVariable,
  createNotEquals,
  getEnumType
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
  resolveTypes,
  resolveNamespace,
  resolveInterfaces
} from './resolve';
import {
  validateTypes,
  validateStructs
} from './validate';

import {
  identifiers as _id
} from './ast/identifiers';
import {
  types as _types
} from './ast/thrift-types';
import {
  methods as _methods
} from './ast/methods';
import {
  tokens as _tokens
} from './ast/tokens';

export function parseFile(fileName: string): Promise<any> {
  return readFile(fileName).then(idl => {
    return thriftParser(idl)
  })
}

function createAssignment(left, right) {
  const _propertyAssignment = ts.createAssignment(left, right);

  return ts.createStatement(_propertyAssignment);
}

function createConstructor(struct: ResolvedStruct) {

  const _argsType = ts.createTypeReferenceNode(struct.implements, undefined);

  const _argsParameter = ts.createParameter(undefined, undefined, undefined, _id.args, _tokens.question, _argsType, undefined);

  const _fieldAssignments = struct.fields.map(function(field) {

    const _argsPropAccess = ts.createPropertyAccess(_id.args, field.name);
    const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);

    // Map is supposed to use Thrift.copyMap but that doesn't work if we use something better than an object
    // Set/List is supposed to use Thrift.copyList but the implementation is weird and might not work when combined with the custom Map copying
    // TODO: should we perform a deep clone? Currently shallow but not sure if deep cloning is actually needed
    let _thenAssign;
    switch(getEnumType(field.type)) {
      case 'SET': {
        // TODO: without some sort of recursion/deep-clone, a Set inside a Map/Set/List won't be a true Set but forEach should operate the same way
        // However, it wouldn't ensure unique values
        const _copy = ts.createNew(_id.Set, undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'LIST': {
        const _copy = ts.createCall(_methods.Arrayfrom, undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'MAP': {
        // TODO: without some sort of recursion/deep-clone, a Map inside a Map/Set/List won't be a true Map which would screw up our forEach
        const _copy = ts.createNew(_id.Map, undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'STRUCT': {
        const _new = ts.createNew(ts.createIdentifier(field.tsType), undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _new);
        break;
      }
      case 'BOOL': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'I32': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'I16': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'STRING': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'BINARY': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'DOUBLE': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'I64': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'BYTE': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      // The thrift binary warns to use i8 but then spits out writeByte
      case 'I8': {
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
  return ts.createMethod(undefined, [_tokens.public], undefined, _id.read, undefined, undefined, [_inputDeclaration], undefined, _readBlock);
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

  const _writeStructBeginCall = ts.createCall(_methods.writeStructBegin, undefined, [ts.createLiteral(`${service.name}`)]);
  const _writeStructBeginStatement = ts.createStatement(_writeStructBeginCall);

  const _writeFields = service.fields.map(createWriteField);

  const _writeFieldStopCall = ts.createCall(_methods.writeFieldStop, undefined, undefined);
  const _writeFieldStopStatement = ts.createStatement(_writeFieldStopCall);

  const _writeStructEndCall = ts.createCall(_methods.writeStructEnd, undefined, undefined);
  const _writeStructEndStatement = ts.createStatement(_writeStructEndCall);

  const _writeBlock = ts.createBlock([
    _writeStructBeginStatement,
    ..._writeFields,
    _writeFieldStopStatement,
    _writeStructEndStatement
  ], true);

  const _outputDeclaration = ts.createParameter(undefined, undefined, undefined, _id.output, undefined, undefined, undefined);
  return ts.createMethod(undefined, [_tokens.public], undefined, _id.write, undefined, undefined, [_outputDeclaration], undefined, _writeBlock);
}

interface ResolvedTypedef {
  name: string,
  type: string,
  originalType: string
}

interface ResolvedStruct {
  name: string,
  implements: string,
  fields: ResolvedField[]
}

interface ResolvedInterface {
  name: string,
  fields: ResolvedFieldBase[]
}

interface ResolvedFieldBase {
  name: string,
  type: string | any, // TODO: objects/Typedef
  option?: string
}

interface ResolvedField extends ResolvedFieldBase {
  tsType: string | any, // TODO: objects/Typedef
  defaultValue?: any
}

type ResolvedNamespace = string;

interface ResolvedIDL {
  namespace?: ResolvedNamespace,
  typedefs: ResolvedTypedef[],
  interfaces: ResolvedInterface[],
  structs: ResolvedStruct[],
}

function createFieldSignature(field) {

  // TODO: have this resolved or something?
  let _type = toAstType(field.type);
  let _optional = toOptional(field.option);

  return ts.createPropertySignature(undefined, field.name, _optional, _type, undefined);
}

function createFieldDeclaration(field) {

  // TODO: have this resolved or something?
  let _type = toAstType(field.tsType);
  let _optional = toOptional(field.option);

  let _default;
  if (field.defaultValue != null) {
    _default = ts.createLiteral(field.defaultValue);
  } else {
    _default = ts.createNull();
  }

  return ts.createProperty(undefined, [_tokens.public], field.name, _optional, _type, _default);
}

function generateTypesAST(idl: ResolvedIDL): string {

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

  const _types = idl.typedefs.map(function(typedef) {
    const _type = ts.createTypeAliasDeclaration(undefined, [_tokens.export], typedef.name, undefined, toAstType(typedef.type));

    return _type;
  });

  const _interfaces = idl.interfaces.map(function(iface) {
    const _interfaceName = ts.createIdentifier(iface.name);

    const _fieldSignatures = iface.fields.map(createFieldSignature);

    const _interface = ts.createInterfaceDeclaration(undefined, [_tokens.export], _interfaceName, [], [], _fieldSignatures);

    return _interface;
  });

  const _structs = idl.structs.map(function(struct) {

    const _fieldDeclarations = struct.fields.map(createFieldDeclaration);

    const _successDeclaration = ts.createProperty(undefined, [_tokens.public], _id.success, undefined, toAstType('bool'), undefined);

    // Build the constructor body
    const _constructor = createConstructor(struct);

    // Build the `read` method
    const _read = createRead(struct.fields);

    // Build the `write` method
    const _write = createWrite(struct);

    const _heritage = ts.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
      ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier(struct.implements))
    ]);

    const _classExpression = ts.createClassExpression([_tokens.export], struct.name, [], [_heritage], [
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
  // TODO: filename?
  if (idl.namespace) {

    const namespace = ts.createIdentifier(idl.namespace);

    const _namespaceBlock = ts.createModuleBlock([
      ..._types,
      ..._interfaces,
      ..._structs
    ]);

    const _namespace = ts.createModuleDeclaration(undefined, [_tokens.export], namespace, _namespaceBlock, ts.NodeFlags.Namespace);
    bodyFile = ts.updateSourceFileNode(bodyFile, [
      _namespace
    ]);
  } else {
    bodyFile = ts.updateSourceFileNode(bodyFile, [
      ..._types,
      ..._interfaces,
      ..._structs
    ]);
  }

  const printer = ts.createPrinter();

  return printer.printBundle(ts.createBundle([
    prefaceFile,
    bodyFile
  ]));
}


export async function generateIDLTypes(filename: string): Promise<string> {
  let idl = await parseFile(filename);

  const namespace = resolveNamespace(idl);

  // Non-mutation
  const typedefs = resolveTypes(idl);
  validateTypes(typedefs);

  const interfaces = resolveInterfaces(idl);
  // TODO: validate interfaces

  const structs = resolveStructs(idl);
  validateStructs(structs);

  const resolved = {
    namespace: namespace,
    typedefs: typedefs,
    interfaces: interfaces,
    structs: structs
  }

  return generateTypesAST(resolved);
}
