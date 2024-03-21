import { IUIKitSurfaceViewParam } from "@rocket.chat/apps-engine/definition/accessors";
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
    InputBlock,
    PlainTextInputElement,
} from "@rocket.chat/ui-kit";

export function oldgenGifModal(app: OneGifApp): IUIKitSurfaceViewParam {
    return {
        id: app.getID(),
        type: UIKitSurfaceType.CONTEXTUAL_BAR,
        title: {
            type: TextObjectType.PLAIN_TEXT,
            text: "GIF Generator",
        },

        blocks: [
            {
                type: BlockType.IMAGE,
                title: {
                    type: TextObjectType.PLAIN_TEXT,
                    text: "Generate a Gif on the go!",
                },
                imageUrl:
                    "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
                altText: "Generate a Gif on the go!",
            },
            getText("Enter a keyword to generate a GIF!"),
            getField("Enter a keyword"),
            {
                type: BlockType.ACTIONS,
                blockId: "gif-actions",
                elements: [
                    {
                        type: "button",
                        appId: app.getID(),
                        blockId: "gif-gen-gif", // Add the missing blockId property
                        text: {
                            type: TextObjectType.PLAIN_TEXT,
                            text: "Generate GIF",
                        },
                        actionId: "gen-gif",
                        value: "Generate GIF",
                        style: ButtonStyle.PRIMARY,
                    },
                ],
            },
        ],
    };

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
            fields: [
                {
                    type: TextObjectType.PLAIN_TEXT,
                    text: text,
                },
            ],
        };

        return textBlock;
    }
}
