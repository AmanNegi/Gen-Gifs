import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { OneGifApp } from "../../OneGifApp";

export class GifEndpoint extends ApiEndpoint {
    path: string = `${this.app.getID()}/gif-res`;

    public async post(
        request: IApiRequest
        // endpoint: IApiEndpointInfo,
        // read: IRead,
        // modify: IModify,
        // http: IHttp,
        // persis: IPersistence
    ): Promise<IApiResponse> {
        console.log(request.content);
        this.app.getLogger().log("GifEndpoint.post", request.content);

        return {
            status: 200,
            content: {
                text: "Hello World",
            },
        };
    }
}
