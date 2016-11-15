import { registerHelper } from 'handlebars'

const tsTypeMap = {
  'string': 'string',
  'bool': 'boolean',
  'int': 'number',
  'i16': 'number',
  'i32': 'number',
}

function tsTypeHelper(type: string) {
  return tsTypeMap[type] || type
}

function upcase(str: string) {
  return str[0].toUpperCase() + str.substr(1)
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
  registerHelper('tsType', tsTypeHelper)
  registerHelper('upcase', upcase)
  registerHelper('getResultType', getResultType)
  registerHelper('getStructOrType', getStructOrType)
}
