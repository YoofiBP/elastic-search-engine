import {Handler} from "./HandlerInterface";
import Ajv from "ajv";
import client from "../elastic-client";

const ajv = new Ajv();

const schema = {
    type: "object",
    properties: {
        institution_id: {
            type: "integer"
        },
        session_hash_id: {
            type: "string"
        },
        user_api_token: {
            type: "string"
        },
        duration_in_ms: {
            type: "integer"
        }
    },
    required: ["institution_id", "session_hash_id", "user_api_token", "duration_in_ms"]
}

const _validate = ajv.compile(schema)

export default class SessionDurationHandler implements Handler {
    public static REGISTRY_ID = "session-duration"
    private readonly payload: {
        [p: string]: any
    }

    constructor(payload) {
        this.payload = payload;
    }

    validate(): boolean {
        return _validate(this.payload)
    }

    async handle() {
        await client.index({
            index: "node_test",
            document: this.payload
        })
    }


}