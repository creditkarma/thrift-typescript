export function isBaseType(type: string) {
  const baseTypes = ['bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'binary', 'slist'];

  // Why doesn't typescript define .includes?
  return (baseTypes.indexOf(type) !== -1);
}

export function isListLikeType(type: string | { name: string }) {
  if (typeof type !== 'object') {
    return false;
  }

  const containerTypes = ['list'];

  return (containerTypes.indexOf(type.name) !== -1);
}

export function isSetLikeType(type: string | { name: string }) {
  if (typeof type !== 'object') {
    return false;
  }

  const containerTypes = ['set'];

  return (containerTypes.indexOf(type.name) !== -1);
}

export function isMapLikeType(type: string | { name: string }) {
  if (typeof type !== 'object') {
    return false;
  }

  const containerTypes = ['map'];

  return (containerTypes.indexOf(type.name) !== -1);
}