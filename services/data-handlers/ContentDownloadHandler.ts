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
        file_url: {
            type: "string"
        },
        duration_in_ms: {
            type: "integer"
        }
    },
    required: ["institution_id", "file_url", "duration_in_ms"]
}

const _validate = ajv.compile(schema)


export default class ContentDownloadHandler implements Handler {
    public static REGISTRY_ID = "content_download_duration_v1";
    private readonly payload: {
        [p: string]: any
    }

    constructor(payload) {
        this.payload = payload;
    }

    async handle(): Promise<void> {
        await client.index({
            index: ContentDownloadHandler.REGISTRY_ID,
            document: this.payload
        })
    }

    validate(): boolean {
        return _validate(this.payload);
    }

}