import * as fs from 'fs'
let thriftParser = require('thrift-parser')
import { compile } from 'handlebars'

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
  const idl = await parseFile(fileName)
  const tpl = await loadTemplate('./templates/types.handlebars')
  return generateTypes(tpl, getStructs(idl))
}
