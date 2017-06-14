#!/usr/bin/env node

/*
This is the CLI tool to validate scripts against a schema.  It uses the API found
in the src/ directory to validate all the files in the file glob CLI parameter.
 */

const packagejson = require('../package.json')
import * as program from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import {generateIDLServices} from './handlebars'
import {generateIDLTypes} from './index'

program
  .version(packagejson.version)
  .alias('thrift-typescript')
  .usage('[options] <file.thrift>')
  .option('-o, --output <path>', 'Output directory')
  .description('Generate TypeScript client for Thrift IDL')
  .parse(process.argv)

async function generateCode(fileName, outputFileName, generator: (filename: string) => Promise<string>) {
  console.log(`Parsing Thrift IDL from ${fileName}`)
  try {
    const script = await generator(fileName)
    const outputName = path.basename(outputFileName)
    const upcaseName = outputName[0].toUpperCase() + outputName.substr(1)
    const outputFile = `${program.output}/${upcaseName}`
    console.log(`Generating TypeScript to ${outputFile}`)
    ensureDirectoryExistence(outputFile)
    fs.writeFileSync(outputFile, script)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

const idlFile = program.args[0]
const typeFile = idlFile.replace('.thrift', '_types.ts')
const codeFile = idlFile.replace('.thrift', '.ts')

generateCode(idlFile, typeFile, generateIDLTypes)
generateCode(idlFile, codeFile, generateIDLServices)
