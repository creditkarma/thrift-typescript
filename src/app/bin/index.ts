#!/usr/bin/env node
import { compile, IMakeOptions } from '../index'
import { resolveOptions } from './resolveOptions'

const cliArgs: Array<string> = process.argv.slice(2)
const options: IMakeOptions = resolveOptions(cliArgs)

compile(options)