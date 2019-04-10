import { TextLocation } from '@creditkarma/thrift-parser'
import { emptyLocation } from './utils'

export const enum ErrorType {
    ValidationError = 'ValidationError',
    ResolutionError = 'ResolutionError',
    GenerationError = 'GenerationError',
}

export interface IThriftError {
    type: ErrorType
    message: string
    loc: TextLocation
}

export class ValidationError extends Error {
    public message: string
    public loc: TextLocation
    constructor(msg: string, loc: TextLocation) {
        super(msg)
        this.message = msg
        this.loc = loc
    }
}

export function createValidationError(
    message: string,
    loc: TextLocation = emptyLocation(),
): IThriftError {
    return {
        type: ErrorType.ValidationError,
        message,
        loc,
    }
}
