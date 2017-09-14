import * as fs from 'fs'
import * as path from 'path'

function createPath(parts: Array<string>, soFar: string): void {
  const current: string = path.join(soFar, parts[0])
  if (!fs.existsSync(current)) {
    fs.mkdirSync(current)
  }

  if (parts.length > 1) {
    createPath(parts.slice(1), current)
  }
}

export function mkdir(dirPath: string): void {
  const parts: Array<string> = dirPath.split(path.sep).filter((val: string) => val !== '')
  if (parts.length > 0) {
    createPath(parts, '.')
  }
}