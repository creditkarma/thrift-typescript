import {
  InterfaceWithFields,
  FieldDefinition,
} from '@creditkarma/thrift-parser'

export function hasRequiredField(struct: InterfaceWithFields): boolean {
  return struct.fields.reduce((acc: boolean, next: FieldDefinition) => {
    if (acc === false) {
      acc = next.requiredness === 'required'
    }
    return acc
  }, false)
}
