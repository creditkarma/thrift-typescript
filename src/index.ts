import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
let thriftParser = require('thrift-parser')
import { compile } from 'handlebars'
import { registerHelpers } from './ts-helpers'

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

function generateServicesAST(services: any[]): string {
  // TODO: bundle maybe?
  let src = ts.createSourceFile('output.ts', '', ts.ScriptTarget.ES5, false, ts.ScriptKind.TS);
  // TODO: imports?

  services.forEach(function(service) {
    const _exportModifier = ts.createToken(ts.SyntaxKind.ExportKeyword);
    const _publicModifier = ts.createToken(ts.SyntaxKind.PublicKeyword);
    const _numberKeyword = ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    const _stringKeyword = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    const _booleanKeyword = ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    const _questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);

    const _fieldDeclarations = service.fields.map(function(field) {

      let _optional;
      // TODO: doesn't seem to be working
      switch(field.option) {
        case 'optional':
          _optional = _questionToken;
          break;
      }

      let _type;
      switch(field.type) {
        case 'int':
        case 'i16':
        case 'i32':
          _type = _numberKeyword;
          break;
        case 'string':
          _type = _stringKeyword;
          break;
        case 'bool':
          _type = _booleanKeyword;
          break;
      }

      let _default;
      if (field.defaultValue != null) {
        _default = ts.createLiteral(field.defaultValue);
      }

      return ts.createProperty(undefined, [_publicModifier], field.name, _optional, _type, _default);
    });

    const _successDeclaration = ts.createProperty(undefined, [_publicModifier], 'success', undefined, _booleanKeyword, undefined);

    const _argsDeclaration = ts.createParameter(undefined, undefined, undefined, 'args', _questionToken, undefined, undefined);

    const _fieldDefaultExpressions = service.fields.map(function(field) {
      const _propertyAccessExpression = ts.createPropertyAccess(ts.createThis(), field.name);
      const _propertyAssignment = ts.createAssignment(_propertyAccessExpression, ts.createNull());
      const _propertyStatement = ts.createStatement(_propertyAssignment);

      return _propertyStatement;
    });

    const _fieldAssignments = service.fields.map(function(field) {
      const _argsPropAccess = ts.createPropertyAccess(ts.createIdentifier('args'), field.name);
      const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);
      const _propertyAssignment = ts.createAssignment(_thisPropAccess, _argsPropAccess);
      const _assignStatment = ts.createStatement(_propertyAssignment)

      const _comparison = ts.createBinary(_argsPropAccess, ts.SyntaxKind.ExclamationEqualsToken, ts.createNull());

      let _else;
      if (field.option === 'required') {
        const _throwAccess = ts.createPropertyAccess(ts.createIdentifier('Thrift'), 'TProtocolException');
        const _errType = ts.createPropertyAccess(
          ts.createIdentifier('Thrift'),
          ts.createIdentifier('TProtocolExceptionType.UNKNOWN')
        )
        const _errArgs = [_errType, ts.createLiteral(`Required field ${field.name} is unset!`)];
        const _newError = ts.createNew(_throwAccess, undefined, _errArgs);
        const _throw = ts.createThrow(_newError);
        _else = ts.createBlock([_throw]);
      }
      const _if = ts.createIf(_comparison, ts.createBlock([_assignStatment]), _else);

      return _if;
    })

    const _ifArgs = ts.createIf(ts.createIdentifier('args'), ts.createBlock(_fieldAssignments));

    const _constructorBlock = ts.createBlock([
      ..._fieldDefaultExpressions,
      _ifArgs
    ], true);

    const _constructor = ts.createConstructor(undefined, undefined, [_argsDeclaration], _constructorBlock);

    const _inputDeclaration = ts.createParameter(undefined, undefined, undefined, 'input', undefined, undefined, undefined);
    const _read = ts.createMethodDeclaration(undefined, [_publicModifier], undefined, 'read', undefined, undefined, [_inputDeclaration], undefined, undefined);

    const _outputDeclaration = ts.createParameter(undefined, undefined, undefined, 'output', undefined, undefined, undefined);
    const _write = ts.createMethodDeclaration(undefined, [_publicModifier], undefined, 'write', undefined, undefined, [_outputDeclaration], undefined, undefined);

    const _propertyDeclarations = [_successDeclaration, ..._fieldDeclarations];

    const _classExpression = ts.createClassExpression([_exportModifier], service.name, [], [], [
      ..._propertyDeclarations,
      _constructor,
      _read,
      _write
    ]);

    const _classStatement = ts.createStatement(_classExpression);

    src = ts.updateSourceFileNode(src, [_classStatement]);
  });


  const printer = ts.createPrinter();

  return printer.printFile(src);
}

export async function generateIDLTypesAST(filename: string): Promise<string> {
  registerHelpers();
  const idl = await parseFile(filename);
  const structs = getStructs(idl);
  const out = generateServicesAST(structs);

  console.log(out);

  return generateTypes(structs);
}
