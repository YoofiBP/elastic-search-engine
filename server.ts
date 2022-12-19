import handlerRegistry from "./services/data-handlers/handler-registry";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as config from "./config"

const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan("tiny"))

app.post("/ingest", (req, res) => {
    const {metric, ...payload} = req.body;

    const handlerFound = handlerRegistry[metric];
    if(!handlerFound) res.status(400).send({"message": "Unrecognized metric"});

    const handler = new handlerFound(payload);
    if(!handler.validate()) res.status(422).send({"message": "Invalid request body"});

    handler.handle();
    res.status(200).send();
})

app.listen(config.PORT, () => console.log(`App running on ${config.PORT}`))
