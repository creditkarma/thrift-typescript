
export function resolveNamespace(idl) {
  // TODO: the parser doesn't parse dot-separated namespaces
  const scope = 'js';

  if (idl.namespace && idl.namespace[scope]) {
    return idl.namespace[scope].serviceName;
  }
}