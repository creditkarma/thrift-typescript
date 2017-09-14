import { IResolvedNamespaceMap } from '../../types'

export function genPathForNamespace(ns: string): string {
  return ns.split('.').join('/')
}

/**
 * In Scrooge we are defaulting to use the Java namespace, so keeping that for now.
 * Probably want to update at somepoint to not fall back to that, or have the fallback
 * be configurable.
 *
 * @param namespaces
 */
export function getNamespace(namespaces: IResolvedNamespaceMap): string {
  return (
    (namespaces.js != null) ?
      namespaces.js.name :
      (namespaces.java != null) ?
        namespaces.java.name :
        ''
  )
}