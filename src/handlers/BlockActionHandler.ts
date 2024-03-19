import { ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { OneGifApp } from "../../OneGifApp";

export class BlockActionHandler {
    private context: UIKitBlockInteractionContext;

    constructor(
        app: OneGifApp,
        context: UIKitBlockInteractionContext,
        private readonly logger: ILogger
    ) {
        this.context = context;
    }

    public async handle(): Promise<IUIKitResponse> {
        const { actionId, user, room, container, blockId } =
            this.context.getInteractionData();

        if (actionId === "gen-gif") {
            this.logger.log("Generating a gif");
            //TODO:  Generate GIF's
        }

        return this.context.getInteractionResponder().successResponse();
    }
}
