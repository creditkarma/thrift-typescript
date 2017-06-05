import { getStructs } from './get';

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

  if (idl.struct[type]) {
    return {
      name: 'struct',
      constructor: type
    };
  }

  return;
}

export function resolveStructs(idl) {
  const structs = getStructs(idl);

  return structs.map((struct) => {
    const { name } = struct;

    // TODO: add "success" property to this list?
    const fields = struct.fields.map((field, idx) => {
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

      return updated;
    });

    return {
      name: name,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      fields: fields
    };
  });
}

export function resolveNamespace(idl) {
  // TODO: the parser doesn't parse dot-separated namespaces
  const scope = 'js';

  if (idl.namespace && idl.namespace[scope]) {
    return idl.namespace[scope].serviceName;
  }
}