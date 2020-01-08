#!/usr/bin/env node
import { generate } from '../index'
import { IMakeOptions } from '../types'
import { resolveOptions } from './resolveOptions'

const cliArgs: Array<string> = process.argv.slice(2)
const options: IMakeOptions = resolveOptions(cliArgs)

generate(options).catch(() => {
    process.exit(1)
})
