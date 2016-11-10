import * as fs from 'fs'
let thriftParser = require('thrift-parser')
import { compile } from 'handlebars'
import { registerHelpers } from './ts-helpers'

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

async function generateTypes(types: any) {
  const template: HandlebarsTemplateDelegate = await loadTemplate('./templates/types.hbs')
  return Object.keys(types).map(key => template({
    fields: types[key],
    name: key,
  }))
}

function getServices(idl: any) {
  return idl.service
}

async function generateServices(services: any) {
  const template: HandlebarsTemplateDelegate = await loadTemplate('./templates/services.hbs')
  return Object.keys(services).map(key => template({
    name: key,
    params: services[key],
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
  registerHelpers()
  const idl = await parseFile(fileName)
  const structs = getStructs(idl)
  return generateTypes(structs)
}

export async function generateServiceScript(fileName: string): Promise<string[]> {
  registerHelpers()
  const idl = await parseFile(fileName)
  const services = getServices(idl)
  return generateServices(services)
}
