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

        const query = context.getArguments().join(" ").trim();
        if (query.trim() === "list") {
            const triggerId = context.getTriggerId() ?? "";

            const modal = await genGifModal(this.app, read);
            modify
                .getUiController()
                .openSurfaceView(modal, { triggerId }, context.getSender());

            return;
        }

        // Add Queued Message, while the GIF is being generated
        const builder = modify.getCreator().startMessage({
            room: context.getRoom(),
            sender: context.getSender(),
            threadId: context.getThreadId(),
            text:
                "Your GIF is being generated. Please wait...\nPrompt: " + query,
            emoji: ":hourglass_flowing_sand:",
        });

        // id is required prior to request, as its an parameter in the request
        // the id is used to update/delete the old message once the GIF is generated
        const id = await modify.getCreator().finish(builder);

        // Send the request to the GIF service
        // -> Temporarily a web server which simply takes request and passes on to replicate API
        const res = await http.post(`http://localhost:4000/`, {
            data: {
                uid: context.getSender().id,
                roomId: context.getRoom().id,
                apiKey,
                awaitMessageId: id,
                query,
            },
        });

        // If the request fails, delete the status message immediately
        if (res.statusCode !== HttpStatusCode.OK) {
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
    }
}
