#!/usr/bin/env node

/*
This is the CLI tool to validate scripts against a schema.  It uses the API found
in the src/ directory to validate all the files in the file glob CLI parameter.
 */

const packagejson = require('../package.json')
import * as program from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import {generateServiceScript} from './index'

program
  .version(packagejson.version)
  .alias('thrift-typescript')
  .usage('[options] <file.thrift>')
  .option('-o, --output <path>', 'Output directory')
  .description('Generate TypeScript client for Thrift IDL')
  .parse(process.argv)

async function generateService(fileName) {
  console.log(`\nParsing Thrift IDL from ${fileName}`)
  try {
    const script = await generateServiceScript(fileName)
    const outputName = path.basename(fileName).replace('thrift', 'ts')
    const upcaseName = outputName[0].toUpperCase() + outputName.substr(1)
    const outputFile = `${program['output']}/${upcaseName}`
    fs.writeFileSync(outputFile, script)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

generateService(program.args[0])
