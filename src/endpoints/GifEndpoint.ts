import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { OneGifApp } from "../../OneGifApp";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export type GifPersistentData = {
    generated_gifs: Array<{ query: string; url: string }>;
};

export class GifEndpoint extends ApiEndpoint {
    path: string = `${this.app.getID()}/gif-res`;

    GifEndpoint(app: OneGifApp) {
        console.log("GifEndpoint.constructor");
        console.log(this.path);
        app.getLogger().log("GifEndpoint.constructor", this.path);
    }

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        const {
            query,
            gifUrl,
            roomId,
            uid,
            awaitMessageId,
        }: {
            query: string;
            gifUrl: string;
            roomId: string;
            uid: string;
            awaitMessageId: string;
        } = request.content;

        if (!query || !gifUrl || !roomId || !uid) {
            
            return {
                status: 400,
                content: {
                    text: "Bad Request",
                },
            };
        }

        this.app.getLogger().log("GifEndpoint.post", request);

        const sender = await read.getUserReader().getById(uid);

        const room = await read.getRoomReader().getById(roomId);

        if (!sender || !room) {
            return {
                status: 404,
                content: {
                    text: "User or Room not found",
                },
            };
        }

        //TODO:  update old message

        const mes = await read.getMessageReader().getById(awaitMessageId);

        if (!mes) {
            return {
                status: 404,
                content: {
                    text: "Message not found",
                },
            };
        }

        await modify.getDeleter().deleteMessage(mes, sender);

        const message = modify.getCreator().startMessage({
            room,
            sender,
            text: `Prompt: ${query}`,
            attachments: [
                {
                    title: {
                        value: query,
                    },
                    imageUrl: gifUrl,
                },
            ],
        });
        // message.setText(`Prompt: ${query}`);

        // message.setAttachments([
        //     {
        //         title: {
        //             value: query,
        //         },
        //         imageUrl: gifUrl,
        //     },
        // ]);

        // const message = modify.getCreator().startMessage({
        //     room,
        //     sender,
        //     attachments: [
        //         {
        //             title: q,
        //             imageUrl: gifUrl,
        //         },
        //     ],
        // });

        await modify.getCreator().finish(message);

        // Save generations to local device
        // const oldData = await read.getPersistenceReader().read("gen-gif");
        const oldData = await read
            .getPersistenceReader()
            .readByAssociation(
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    "gen-gif"
                )
            );

        this.app.getLogger().log("1. GifEndpoint.post", oldData);

        if (!oldData || oldData.length <= 0) {
            // await persis.create({
            //     generated_gifs: [{ query: query, url: gifUrl }],
            // });
            await persis.createWithAssociation(
                {
                    generated_gifs: [
                        {
                            query: query,
                            url: gifUrl,
                        },
                    ],
                },
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    "gen-gif"
                )
            );

            this.app.getLogger().log("2. GifEndpoint.post");
        } else {
            await persis.updateByAssociation(
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    "gen-gif"
                ),
                {
                    generated_gifs: [
                        { query: query, url: gifUrl },
                        ...(oldData[0] as GifPersistentData).generated_gifs,
                    ],
                }
            );
            this.app.getLogger().log("3. GifEndpoint.post");
            // const oldData = (await read
            //     .getPersistenceReader()
            //     .read("gen-gif")) as {
            //     generated_gifs: Array<{ query: string; url: string }>;
            // };
            // await persis.update("gen-gif", {
            //     generated_gifs: [
            //         { query: query, url: gifUrl },
            //         ...oldData.generated_gifs,
            //     ],
            // });
        }

        // sendGifToRoom(
        //     request.content.context,
        //     read,
        //     modify,
        //     http,
        //     persis,
        //     request.content.title,
        //     request.content.gifUrl
        // );

        return {
            status: 200,
            content: {
                text: "Hello World",
                request,
                room,
                sender,
            },
        };
    }
}
