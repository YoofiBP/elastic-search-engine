import {Handler} from "./HandlerInterface";
import client from "../elastic-client";
import {AjvValidationError} from "../../exceptions";
import ajvValidator from "../validation";

const publishSchema = {
    type: "object",
    properties: {
        institution_id: {
            type: "integer"
        },
        session_hash_id: {
            type: "string"
        },
        course_hash_id: {
            type: "string"
        },
        folder_hash_id: {
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
    required: ["institution_id", "session_hash_id", "course_hash_id", "user_api_token", "duration_in_ms"]
}

const validateForPublishing = ajvValidator.compile(publishSchema)

const queryParamSchema = {
    type: "object",
    properties: {
        institution_id: {
            type: "integer"
        },
        startDate: {
            type: "string"
        },
        endDate: {
            type: "string"
        }
    },
    required: ["institution_id"]
}

const validateParams = ajvValidator.compile<Params>(queryParamSchema);

type Params = {
    institution_id: string;
    startDate?: string;
    endDate?: string;
}

export default class SessionDurationHandler implements Handler {
    public static REGISTRY_ID = "user_session_duration_data_v1"

    async publish(payload) {
        if(!validateForPublishing(payload)) throw new AjvValidationError(validateForPublishing.errors)
        await client.index({
            index: SessionDurationHandler.REGISTRY_ID,
            document: payload
        })
    }


    async fetchAnalytics(params: object): Promise<void> {
        if(!validateParams(params)) throw new AjvValidationError(validateParams.errors);

        const {institution_id, startDate, endDate} = params;
        return await client.search({
            index: SessionDurationHandler.REGISTRY_ID,
            size: 0,
            query: {
                bool: {
                    filter: [
                        {
                            match: {
                                institution_id
                            }
                        },
                        {
                            range: {
                                "@timestamp": {
                                    gte: startDate ?? "now-30d/d",
                                    lte: endDate ?? "now"
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
        });
    }
}