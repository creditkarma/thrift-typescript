import AliasTypeNode from './AliasTypeNode'
import BaseTypeNode from './BaseTypeNode'
import ListTypeNode from './ListTypeNode'
import MapTypeNode from './MapTypeNode'
import SetTypeNode from './SetTypeNode'
import StructTypeNode from './StructTypeNode'

// TODO: interface?
// TODO: Can't assign InvalidTypeNode here due to return type
type TypeNode = BaseTypeNode | AliasTypeNode | MapTypeNode | ListTypeNode | SetTypeNode | StructTypeNode

export default TypeNode
