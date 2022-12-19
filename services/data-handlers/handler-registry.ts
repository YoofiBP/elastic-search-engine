import SessionDurationHandler from "./SessionDurationHandler";
import ContentDownloadHandler from "./ContentDownloadHandler";

export default {
    [SessionDurationHandler.REGISTRY_ID]: SessionDurationHandler,
    [ContentDownloadHandler.REGISTRY_ID]: ContentDownloadHandler
}
