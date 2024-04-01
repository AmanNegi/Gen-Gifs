import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";

/**
 * Helper function to send the GIF to the room
 */
export default async function sendGifToRoom(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persis: IPersistence,
    title: string,
    gifUrl: string
) {
    const builder = modify
        .getCreator()
        .startMessage()
        .setSender(context.getSender())
        .setRoom(context.getRoom());

    const tid = context.getThreadId();

    if (tid) {
        builder.setThreadId(tid);
    }

    builder.addAttachment({
        title: {
            value: title.substring(0, 75).trim().replace(" ", "-"),
        },
        imageUrl: gifUrl,
    });

    const oldData = await read.getPersistenceReader().read("gen-gif");
    if (!oldData) {
        await persis.create({
            generated_gifs: [{ query: title, url: gifUrl }],
        });
    } else {
        const oldData = (await read.getPersistenceReader().read("gen-gif")) as {
            generated_gifs: Array<{ query: string; url: string }>;
        };
        await persis.update("gen-gif", {
            generated_gifs: [
                { query: title, url: gifUrl },
                ...oldData.generated_gifs,
            ].slice(0, Math.min(9, oldData.generated_gifs.length)),
        });
    }
    await modify.getCreator().finish(builder);
}
