
export function validateTypes(typedefs) {
  typedefs.forEach((typedef) => {
    if (!typedef.type) {
      throw new Error(`Unable to find typedef: ${typedef.originalType}`)
    }
  })
}

export function validateStructs(structs) {
  structs.forEach((struct) => {
    // console.log(struct);
    // TODO: Can this ever be undefined?
    if (!struct.name) {
      throw new Error('Struct must have a name')
    }

    // TODO: this should be able to use validateTypes
    // needs the same data structure
    struct.fields.forEach((field) => {
      if (!field.type) {
        throw new Error(`Unable to find typedef: ${field.tsType}`)
      }
    })
  })
}
