import { TextLocation } from '@creditkarma/thrift-parser'
import * as os from 'os'

import { ErrorType, IThriftError } from '../errors'
import { INamespace, ISourceFile } from '../types'

interface IErrorFile {
    sourceFile: ISourceFile
    errors: Array<IThriftError>
}

interface IFormattedError {
    sourceLine: string
    locIndicator: string
    line: number
    column: number
    message: string
    type: ErrorType
}

function padLeft(num: number, str: string): string {
    while (str.length < num) {
        str = ' ' + str
    }
    return str
}

function indicatorForLocaction(loc: TextLocation): string {
    const indicator: string = padLeft(loc.start.column, '^')
    return indicator
}

function padStart(length: number, str: string): string {
    let paddedStr: string = str
    while (length--) {
        paddedStr = ' ' + paddedStr
    }

    return paddedStr
}

function errorType(type: ErrorType): string {
    switch (type) {
        case ErrorType.ValidationError:
            return 'Validation Error:'

        case ErrorType.ResolutionError:
            return 'Identifier Resolution Error:'

        case ErrorType.GenerationError:
            return 'Code Generation Error:'
    }
}

function printErrorForFile<T extends IErrorFile>(file: T): void {
    const sourceLines: Array<string> = file.sourceFile.source.split(os.EOL)
    const formattedErrors: Array<IFormattedError> = file.errors.map(
        (next: IThriftError): IFormattedError => {
            return formatError(next)
        },
    )

    function getSourceLine(lineNumber: number): string {
        return sourceLines[lineNumber - 1]
    }

    function formatError(err: IThriftError): IFormattedError {
        return {
            sourceLine: getSourceLine(err.loc.start.line),
            locIndicator: indicatorForLocaction(err.loc),
            line: err.loc.start.line,
            column: err.loc.start.column,
            message: err.message,
            type: err.type,
        }
    }

    console.log(
        `Error generating file '${file.sourceFile.path}/${file.sourceFile.name}.thrift': ${file.errors.length} errors found:`,
    )
    formattedErrors.forEach((err: IFormattedError): void => {
        const prefix: string = `${err.line} | `

        console.log()
        console.log(`${errorType(err.type)}\n`)
        console.log(`Message: ${err.message}`)
        console.log()
        console.log(`${prefix}${err.sourceLine}`)
        console.log(padStart(prefix.length, err.locIndicator))
        console.log()
    })
}

export function printErrorsForFiles<T extends IErrorFile>(
    files: Array<T>,
): void {
    files.forEach((next: T): void => {
        printErrorForFile(next)
    })
}

export function printErrors(files: Array<INamespace>): void {
    files.forEach((next: INamespace) => {
        console.log(
            `Errors encountered while generating namesapce: ${next.namespace.name}`,
        )
        console.log()
        next.errors.forEach((err: IThriftError) => {
            console.log(`Error: ${err.message}`)
            console.log()
        })
    })
}

export function collectInvalidFiles<T extends { errors: Array<IThriftError> }>(
    resolvedFiles: Array<T>,
    errors: Array<T> = [],
): Array<T> {
    for (const file of resolvedFiles) {
        if (file.errors.length > 0) {
            errors.push(file)
        }
    }

    return errors
}
