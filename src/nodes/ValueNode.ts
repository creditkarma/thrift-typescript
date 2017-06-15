import BaseValueNode from './BaseValueNode'
import ListValueNode from './ListValueNode'
import MapValueNode from './MapValueNode'
import SetValueNode from './SetValueNode'
import StructValueNode from './StructValueNode'

type ValueNode = BaseValueNode | StructValueNode | MapValueNode | SetValueNode | ListValueNode

export default ValueNode
