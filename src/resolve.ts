import {
  getStructs,
  getTypeDefs
} from './get';

function isBaseType(type: string) {
  const baseTypes = ['bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'binary', 'slist'];

  // Why doesn't typescript define .includes?
  return (baseTypes.indexOf(type) !== -1);
}

function isContainerType(type: string) {
  const containerTypes = ['map', 'set', 'list'];

  return (containerTypes.indexOf(type) !== -1);
}

function resolveType(idl, type: string) {

  // TODO: resolve these to typescript types?

  if (isBaseType(type)) {
    return type;
  }

  // TODO: handle container types?
  // if (isContainerType(type)) {

  // }

  if (idl.typedef[type]) {
    return resolveType(idl, idl.typedef[type].type);
  }

  // TODO: structs as types in typedefs

  return;
}

export function resolveTypes(idl) {
  const typedefs = getTypeDefs(idl);

  typedefs.forEach((typedef) => {
    const { name, type } = typedef;

    idl.typedef[name].originalType = type;

    let resolvedType = resolveType(idl, type);

    idl.typedef[name].type = resolvedType;
  });
}

export function resolveStructs(idl) {
  const structs = getStructs(idl);

  structs.forEach((struct) => {
    const { name } = struct;

    struct.fields.forEach((field, idx) => {
      let updated;

      if (typeof field.type === 'object') {
        // TODO: don't skip over
        updated = Object.assign({}, field, {
          tsType: field.type
        });
      } else {
        updated = Object.assign({}, field, {
          tsType: field.type,
          type: resolveType(idl, field.type)
        });
      }

      idl.struct[name].splice(idx, 1, updated);
    });
  });
}

