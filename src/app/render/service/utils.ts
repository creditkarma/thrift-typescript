import {
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition
} from '@creditkarma/thrift-parser'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createStructArgsName(service: ServiceDefinition, def: FunctionDefinition | FieldDefinition): string {
  return `${service.name.value}${capitalize(def.name.value)}Args`
}

export function createStructResultName(service: ServiceDefinition, def: FunctionDefinition | FieldDefinition): string {
  return `${service.name.value}${capitalize(def.name.value)}Result`
}

export function createStructHandlerName(service: ServiceDefinition): string {
  return `I${service.name.value}Handler`;
}