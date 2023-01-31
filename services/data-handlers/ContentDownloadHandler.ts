import {Handler} from "./HandlerInterface";
import Ajv from "ajv";
import client from "../elastic-client";
import {AjvValidationError} from "../../exceptions";

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
        file_size_in_bytes: {
            type: "integer"
        },
        duration_in_ms: {
            type: "integer"
        }
    },
    required: ["institution_id", "file_url", "duration_in_ms", "file_size_in_bytes"]
}

const _validate = ajv.compile(schema)


export default class ContentDownloadHandler implements Handler {
    public static REGISTRY_ID = "content_download_duration_v1";


    async publish(payload): Promise<void> {
        if(!_validate(payload)) throw new AjvValidationError(_validate.errors)
        await client.index({
            index: ContentDownloadHandler.REGISTRY_ID,
            document: payload
        })
    }

    async fetchAnalytics(): Promise<void> {
        return  await client.search({
            index: ContentDownloadHandler.REGISTRY_ID,
            query: {
                match: { quote: 'winter' }
            }
        })
    }

}