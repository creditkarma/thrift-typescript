function assign(obj1, obj2) {
  return Object.assign({}, obj1, obj2)
}

export default function collect(definitions = {}) {
  return Object.keys(definitions).map((name) => {
    const definition = definitions[name]
    if (Array.isArray(definition)) {
      return { name, fields: definition }
    } else {
      return assign(definition, { name })
    }
  })
}
