import StructNode from './StructNode'
import UnionPropertyNode from './UnionPropertyNode'

export default class UnionNode extends StructNode {
  public fields: UnionPropertyNode[]

  // TODO: validate single default
}
