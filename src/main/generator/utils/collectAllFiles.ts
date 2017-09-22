import {
  IRenderedFile
} from '../../types'

export function collectAllFiles(files: Array<IRenderedFile>): Array<IRenderedFile> {
  return files.reduce((acc: Array<IRenderedFile>, next: IRenderedFile) => {
    const includes: Array<IRenderedFile> = []
    for (const name of Object.keys(next.includes)) {
      includes.push(next.includes[name])
    }

    return [
      ...acc,
      next,
      ...collectAllFiles(includes),
    ]
  }, [])
}
