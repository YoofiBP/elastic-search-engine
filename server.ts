import handlerRegistry from "./services/data-handlers/handler-registry";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as config from "./config"
import {ValidationError} from "./exceptions";

const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan("tiny"))

app.post("/ingest", (req, res) => {
    try {
        const {metric, ...payload} = req.body;

        const handlerFound = handlerRegistry[metric];
        if (!handlerFound) return res.status(400).send({"message": "Unrecognized metric"});

        const handler = new handlerFound();

        handler.publish(payload);
        res.status(200).send();
    } catch (e) {
        if (e instanceof ValidationError) return res.status(422).send({"message": e.message});
        res.status(500).send();
    }
})

app.get("/analytics", (req, res) => {

    const {metric, params} = req.body;
    const handlerFound = handlerRegistry[metric];
    if (!handlerFound) return res.status(400).send({"message": "Unrecognized metric"})

})

app.listen(config.PORT, () => console.log(`App running on ${config.PORT}`))
