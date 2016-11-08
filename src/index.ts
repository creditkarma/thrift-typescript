import * as fs from 'fs'
let thriftParser = require('thrift-parser')
import { compile, registerHelper } from 'handlebars'

function readFile(fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
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
  return idl.struct
}

async function generateTypes(template: HandlebarsTemplateDelegate, types: any) {
  return Object.keys(types).map(key => template({
    fields: types[key],
    name: key,
  }))
}

function tsTypeHelper(type: string) {
  const map = {
    'string': 'string',
    'bool': 'boolean',
    'int': 'number',
    'i16': 'number',
    'i32': 'number',
  }
  return map[type]
}

function registerHelpers() {
  registerHelper('tsType', tsTypeHelper)
}

export async function loadTemplate(fileName: string): Promise<HandlebarsTemplateDelegate> {
  const src = await readFile(fileName)
  return compile(src)
}

export function parseFile(fileName: string): Promise<any> {
  return readFile(fileName).then(idl => {
    return thriftParser(idl)
  })
}

export async function generateCode(fileName: string): Promise<string[]> {
  registerHelpers()
  const idl = await parseFile(fileName)
  const tpl = await loadTemplate('./templates/types.handlebars')
  return generateTypes(tpl, getStructs(idl))
}
