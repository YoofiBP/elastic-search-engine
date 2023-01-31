import {ErrorObject} from "ajv"

export class AjvValidationError extends Error {
    constructor(errors: ErrorObject[]) {
        super(errors.map(err => err.message).toString());
        this.name = "ValidationError"
    }
}