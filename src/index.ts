import * as fs from 'fs'
let thriftParser = require('thrift-parser')

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

function parseFile(fileName: string): Promise<string> {
  return readFile(fileName).then(idl => {
    return thriftParser(idl)
  })
}

const fileName = process.argv[2]
console.log(`Parsing ${fileName}`)
parseFile(fileName).then(ast => console.dir(ast))
