import {
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { OneGifApp } from "../OneGifApp";
import {
    BlockType,
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { TextObjectType } from "@rocket.chat/ui-kit/dist/esm/blocks/TextObjectType";
import {
    Block,
    BlockElementType,
    ImageBlock,
    InputBlock,
    PlainTextInputElement,
} from "@rocket.chat/ui-kit";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { GifPersistentData } from "../src/endpoints/GifEndpoint";

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

            // getField("Enter a keyword"),
            // {
            //     type: BlockType.ACTIONS,
            //     blockId: "gif-actions",
            //     elements: [
            //         {
            //             type: "button",
            //             appId: app.getID(),
            //             blockId: "gif-gen-gif", // Add the missing blockId property
            //             text: {
            //                 type: TextObjectType.PLAIN_TEXT,
            //                 text: "Generate GIF",
            //             },
            //             actionId: "gen-gif",
            //             value: "Generate GIF",
            //             style: ButtonStyle.PRIMARY,
            //         },
            //     ],
            // },
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

    function getField(text: string): InputBlock {
        const inputBlock: InputBlock = {
            type: BlockType.INPUT,
            blockId: "gif-keyword",
            element: {
                // type: BlockElementType.PLAIN_TEXT_INPUT,
                //TODO: Check why doesn't this work
                type: "plain_text_input",
                actionId: "gif-keyword",
                appId: app.getID(),
                blockId: "gif-keyword",
                placeholder: {
                    type: TextObjectType.PLAIN_TEXT,
                    text: "Enter a keyword",
                },
            },
            label: {
                type: TextObjectType.PLAIN_TEXT,
                text: text,
            },
        };

        return inputBlock;
    }

    function getText(text: string): Block {
        const textBlock: Block = {
            type: BlockType.SECTION,
            text: {
                text: text,
                type: TextObjectType.PLAIN_TEXT,
            },
            // fields: [
            //     {
            //         type: TextObjectType.PLAIN_TEXT,
            //         text: text,
            //     },
            // ],
        };

        return textBlock;
    }
}
