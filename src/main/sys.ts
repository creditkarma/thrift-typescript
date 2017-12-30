import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

function rootDir(): string {
  if (os.platform() === 'win32') {
    return process.cwd().split(path.sep)[0]
  } else {
    return '/'
  }
}

function createPath(parts: Array<string>, soFar: string): void {
  const current: string = path.join(soFar, parts[0])
  if (!fs.existsSync(current)) {
    fs.mkdirSync(current)
  }

  if (parts.length > 1) {
    createPath(parts.slice(1), current)
  }
}

function splitPath(dirPath: string): Array<string> {
  if (os.platform() === 'win32') {
    return dirPath.split(path.sep).filter((val: string) => val !== '').slice(1)
  } else {
    return dirPath.split(path.sep).filter((val: string) => val !== '')
  }
}

export function mkdir(dirPath: string): void {
  const parts: Array<string> = splitPath(dirPath)

  // Check for absolute path
  if (parts.length > 0 && path.isAbsolute(dirPath)) {
    createPath(parts, rootDir())
  } else if (parts.length > 0) {
    createPath(parts, process.cwd())
  }
}
