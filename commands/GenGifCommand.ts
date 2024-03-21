import {
    IRead,
    IModify,
    IHttp,
    IPersistence,
    HttpStatusCode,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { OneGifApp } from "../OneGifApp";
import { genGifModal } from "../modals/gen-gifs";

export class OneGifCommand implements ISlashCommand {
    command = "gen-gif";
    i18nParamsExample = "";
    i18nDescription = "Generate a Gif on the go!";
    providesPreview = false;

    constructor(private readonly app: OneGifApp) {}

    async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const apiKey = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("gif_api_key");

        // const builder = modify
        //     .getCreator()
        //     .startMessage()
        //     .setSender(context.getSender())
        //     .setRoom(context.getRoom());

        //     const tid = context.getThreadId();
        const query = context.getArguments().join(" ").trim();
        //     console.log("Query is", query);

        //     if (tid) {
        //         builder.setThreadId(tid);
        //     }
        if (query.trim() === "list") {
            const triggerId = context.getTriggerId() ?? "";

            const modal = await genGifModal(this.app, read);
            modify
                .getUiController()
                .openSurfaceView(modal, { triggerId }, context.getSender());

            return;
        }

        //     if (!apiKey || apiKey === "") {
        //         builder.setText(
        //             "Seems like you didn't enter your key yet. Please enter your key from app settings."
        //         );

        //         return modify
        //             .getNotifier()
        //             .notifyUser(context.getSender(), builder.getMessage());
        //     }

        //     try {

        // generate unique message id
        const builder = modify.getCreator().startMessage({
            room: context.getRoom(),
            sender: context.getSender(),
            threadId: context.getThreadId(),
            text:
                "Your GIF is being generated. Please wait...\nPrompt: " + query,
            emoji: ":hourglass_flowing_sand:",
        });

        const id = await modify.getCreator().finish(builder);

        const res = await http.post(`http://localhost:4000/`, {
            data: {
                uid: context.getSender().id,
                roomId: context.getRoom().id,
                apiKey,
                awaitMessageId: id,
                query,
            },
        });

        if (res.statusCode !== HttpStatusCode.OK) {
            //TODO: Show toast

            this.app.getLogger().error("Unable to retrieve gifs.");
            const message = await read.getMessageReader().getById(id);
            if (!message) {
                this.app
                    .getLogger()
                    .error("An error occured while clearing helper message.");
                return;
            }
            await modify
                .getDeleter()
                .deleteMessage(message, context.getSender());
        }

        // TODO: Show Toast saying that the generation is in progress
        //         this.app.getLogger().log("HTTP Response: ", res);
        //         if (res && res.statusCode !== HttpStatusCode.OK) {
        //             throw new Error("Unable to retrieve gifs.");
        //         }
        //         builder.addAttachment({
        //             title: {
        //                 value: query.substring(0, 60).trim(),
        //             },
        //             imageUrl: res.content,
        //         });

        //         const oldData = await read.getPersistenceReader().read("gen-gif");
        //         if (!oldData) {
        //             await persis.create({
        //                 generated_gifs: [{ query: query, url: res.content }],
        //             });
        //         } else {
        //             const oldData = (await read
        //                 .getPersistenceReader()
        //                 .read("gen-gif")) as {
        //                 generated_gifs: Array<{ query: string; url: string }>;
        //             };
        //             await persis.update("gen-gif", {
        //                 generated_gifs: [
        //                     { query: query, url: res.content },
        //                     ...oldData.generated_gifs,
        //                 ].slice(0, Math.min(9, oldData.generated_gifs.length)),
        //             });
        //         }
        //         await modify.getCreator().finish(builder);
        //         return;
        //     } catch (e) {
        //         this.app.getLogger().log("Error occurred: ", e);
        //         builder.setText(
        //             "An error occurred when trying to send the gif :disappointed_relieved:"
        //         );

        //         modify
        //             .getNotifier()
        //             .notifyUser(context.getSender(), builder.getMessage());
        //         return;
        //     }
        // }
    }
}
