import {
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { OneGifApp } from "../OneGifApp";
import {
    BlockType,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { TextObjectType } from "@rocket.chat/ui-kit/dist/esm/blocks/TextObjectType";
import { Block, ImageBlock } from "@rocket.chat/ui-kit";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { GifPersistentData } from "../src/endpoints/GifEndpoint";

/**
 * This is the Modal to display the previous generations
 * -> Uses Local Persistence to store the generated GIFs
 */
export async function genGifModal(
    app: OneGifApp,
    read: IRead
): Promise<IUIKitSurfaceViewParam> {
    let data = await read
        .getPersistenceReader()
        .readByAssociation(
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "gen-gif"
            )
        );
    app.getLogger().log("gen-gifs modal", data);
    let gifs: GifPersistentData = { generated_gifs: [] };

    if (!data || data.length > 0) {
        const generatedGifs: GifPersistentData = data[0] as GifPersistentData;
        gifs = generatedGifs;
    }

    return {
        id: app.getID(),
        type: UIKitSurfaceType.CONTEXTUAL_BAR,
        title: {
            type: TextObjectType.PLAIN_TEXT,
            text: "GIF Generator",
        },

        blocks: [
            getText("Your Creations :paintbrush: "),
            ...gifs.generated_gifs.map((gif) => getImage(gif.url, gif.query)),
        ],
    };

    function getImage(url: string, query: string): ImageBlock {
        return {
            type: BlockType.IMAGE,
            title: {
                type: TextObjectType.PLAIN_TEXT,
                text: query,
            },
            appId: app.getID(),
            imageUrl: url,
            altText: query,
        };
    }
    function getText(text: string): Block {
        const textBlock: Block = {
            type: BlockType.SECTION,
            text: {
                text: text,
                type: TextObjectType.PLAIN_TEXT,
            },
        };

        return textBlock;
    }
}
