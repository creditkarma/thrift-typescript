import collect from './collect'

// TODO: Reduce complexity so this doesn't need to exist separately
export function getInterfaces(idl: JsonAST) {
  const unions = collect(idl.union)
  const structs = collect(idl.struct)
  const exceptions = collect(idl.exception)

  unions.forEach((union) => {
    // TODO: this is just a workaround for interfaces
    union.fields = union.fields.map((field) => Object.assign({}, field, { option: 'optional' }))
  })

  return structs.concat(unions).concat(exceptions)
}

// Still used by handlebars
export function getStructs(idl: JsonAST) {
  const structs = idl.struct || {}
  return Object.keys(structs).map((key) => ({
    fields: structs[key],
    name: key,
  }))
}

// Still used by handlebars
export function getServices(idl: JsonAST) {
  return Object.keys(idl.service).map((key) => ({
    methods: idl.service[key].functions,
    name: key,
  }))
}
