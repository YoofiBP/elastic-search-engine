import {Handler} from "./HandlerInterface";
import Ajv from "ajv";
import client from "../elastic-client";
import {ValidationError} from "../../exceptions";

const ajv = new Ajv();

const publishSchema = {
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
    additionalProperties: false,
    required: ["institution_id", "session_hash_id", "user_api_token", "duration_in_ms"]
}

const validateForPublishing = ajv.compile(publishSchema)

const queryParamSchema = {
    type: "object",
    properties: {
        institution_id: {
            type: "integer"
        }
    },
    required: ["institution_id"]
}

const validateParams = ajv.compile(queryParamSchema);

export default class SessionDurationHandler implements Handler {
    public static REGISTRY_ID = "session-duration"

    async publish(payload) {
        if(!validateForPublishing(payload)) throw new ValidationError("Invalid request payload")
        await client.index({
            index: SessionDurationHandler.REGISTRY_ID,
            document: payload
        })
    }

    async fetchAnalytics(params): Promise<void> {
        //validate and parse params
        const {institution_id} = params;
        const result = await client.search({
            index: SessionDurationHandler.REGISTRY_ID,
            query: {
                bool: {
                    filter: [
                        {
                            match: { institution_id }
                        },
                        {
                            range: {
                                "@timestamp": {
                                    gte: "now-30d/d",
                                    lte: "now"
                                }
                            }
                        }
                    ]
                }
            },
            aggs: {
                "avg_reading_time_in_ms": {
                    terms: {
                        field: "course_hash_id"
                    },
                    aggs: {
                        "folders": {
                            terms: {
                                field: "folder_hash_id"
                            },
                            aggs: {
                                "sessions": {
                                    terms: {
                                        field: "session_hash_id"
                                    },
                                    aggs: {
                                        "avg_reading_time_in_ms": {
                                            avg: {
                                                field: "duration_in_ms"
                                            }
                                        }
                                    }
                                },
                                "avg_reading_time_in_ms": {
                                    avg_bucket: {
                                        buckets_path: "sessions>avg_reading_time_in_ms"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        return Promise.resolve(result);
    }
}