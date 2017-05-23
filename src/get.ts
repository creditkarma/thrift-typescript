
export function getTypeDefs(idl: any) {
  const typedefs = idl.typedef || {};
  return Object.keys(typedefs).map(key => Object.assign({ name: key}, typedefs[key]));
}

export function getStructs(idl: any) {
  const structs = idl.struct || {};
  return Object.keys(structs).map(key => ({
    fields: structs[key],
    name: key,
  }))
}

export function getServices(idl: any) {
  return Object.keys(idl.service).map(key => ({
    methods: idl.service[key],
    name: key,
  }));
}