// TypeScript has this as an internal method so implement a custom version
import {
  Block,
  createNodeArray,
  setTextRange,
  updateBlock,
} from 'typescript'

export default function insertLeadingStatements(dest, sources: any[]): Block {
  return updateBlock(dest, setTextRange(createNodeArray(sources.concat(dest.statements)), dest.statements))
}
