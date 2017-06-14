import { registerHelper } from 'handlebars'

const tsTypeMap = {
  string: 'string',
  bool: 'boolean',
  int: 'number',
  i16: 'number',
  i32: 'number',
}

function getResultType(type: string) {
  if (tsTypeMap[type]) {
    return 'args.success'
  } else {
    return `new ttypes.${type}(args.success)`
  }
}

function getStructOrType(type: string) {
  if (tsTypeMap[type]) {
    return type
  } else {
    return 'STRUCT'
  }
}

export function registerHelpers() {
  registerHelper('tsType', (type: string) => tsTypeMap[type] || `ttypes.${type}`)
  registerHelper('upcase', (str: string) => str.toUpperCase())
  registerHelper('capitalize', (str: string) => str[0].toUpperCase() + str.substr(1))
  registerHelper('getResultType', getResultType)
  registerHelper('getStructOrType', getStructOrType)
  registerHelper('isStruct', (type: string) => tsTypeMap[type] ? false : true)
  registerHelper('inc', (val: number) => val + 1)
}
