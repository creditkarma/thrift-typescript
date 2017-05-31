
export function getTypeDefs(idl: any) {
  const typedefs = idl.typedef || {};
  return Object.keys(typedefs).map(key => Object.assign({ name: key}, typedefs[key]));
}

export function getConstants(idl: any) {
  const constants = idl.const || {};
  return Object.keys(constants).map((key) => {
    return {
      name: key,
      type: constants[key].type,
      value: constants[key].value
    };
  });
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