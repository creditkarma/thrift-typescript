import * as fs from 'fs';

export default function readFile(fileName: string): Promise<string> {
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