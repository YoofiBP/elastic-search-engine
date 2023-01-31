const { Client } = require('@elastic/elasticsearch')
import * as config from "../config"

const client = new Client({
    node: config.ANALYTICS_BASE_URL
})

export default client;