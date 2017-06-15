import StructPropertyNode from './StructPropertyNode'

export default class UnionPropertyNode extends StructPropertyNode {

  constructor(args) {
    super(args)
    // Forced to "optional"
    // TODO: should we warn here?
    this.option = 'optional'
  }
}
