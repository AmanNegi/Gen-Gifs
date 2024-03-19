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

        const builder = modify
            .getCreator()
            .startMessage()
            .setSender(context.getSender())
            .setRoom(context.getRoom());

        const tid = context.getThreadId();
        const query = context.getArguments().join(" ").trim();
        console.log("Query is", query);

        if (tid) {
            builder.setThreadId(tid);
        }
        if (query.trim() === "list") {
            const triggerId = context.getTriggerId() ?? "";

            modify
                .getUiController()
                .openSurfaceView(
                    genGifModal(this.app),
                    { triggerId },
                    context.getSender()
                );

            return;
        }

        if (!apiKey || apiKey === "") {
            builder.setText(
                "Seems like you didn't enter your key yet. Please enter your key from app settings."
            );

            return modify
                .getNotifier()
                .notifyUser(context.getSender(), builder.getMessage());
        }

        try {
            const res = await http.get(
                `http://localhost:4000/?api_key=${apiKey}&q=${encodeURIComponent(
                    query
                )}`
            );
            this.app.getLogger().log("HTTP Response: ", res);
            if (res && res.statusCode !== HttpStatusCode.OK) {
                throw new Error("Unable to retrieve gifs.");
            }
            builder.addAttachment({
                title: {
                    value: query.substring(0, 60).trim(),
                },
                imageUrl: res.content,
            });

            const oldData = await read.getPersistenceReader().read("gen-gif");
            if (!oldData) {
                await persis.create({
                    generated_gifs: [{ query: query, url: res.content }],
                });
            } else {
                const oldData = (await read
                    .getPersistenceReader()
                    .read("gen-gif")) as {
                    generated_gifs: Array<{ query: string; url: string }>;
                };
                await persis.update("gen-gif", {
                    generated_gifs: [
                        { query: query, url: res.content },
                        ...oldData.generated_gifs,
                    ].slice(0, Math.min(9, oldData.generated_gifs.length)),
                });
            }
            await modify.getCreator().finish(builder);
            return;
        } catch (e) {
            this.app.getLogger().log("Error occurred: ", e);
            builder.setText(
                "An error occurred when trying to send the gif :disappointed_relieved:"
            );

            modify
                .getNotifier()
                .notifyUser(context.getSender(), builder.getMessage());
            return;
        }
    }
}
