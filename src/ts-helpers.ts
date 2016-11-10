import { registerHelper } from 'handlebars'

function tsTypeHelper(type: string) {
  const map = {
    'string': 'string',
    'bool': 'boolean',
    'int': 'number',
    'i16': 'number',
    'i32': 'number',
  }
  return map[type]
}

function upcase(str: string) {
  return str[0].toUpperCase() + str.substr(1)
}

export function registerHelpers() {
  registerHelper('tsType', tsTypeHelper)
  registerHelper('upcase', upcase)
}
