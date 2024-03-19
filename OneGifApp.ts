import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { OneGifCommand } from "./commands/GenGifCommand";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { BlockActionHandler } from "./src/handlers/BlockActionHandler";
import { GifEndpoint } from "./src/endpoints/GifEndpoint";
import {
    ApiSecurity,
    ApiVisibility,
} from "@rocket.chat/apps-engine/definition/api";

export class OneGifApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(
        configurationExtend: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        await configurationExtend.settings.provideSetting({
            id: "gif_api_key",
            type: SettingType.STRING,
            packageValue: "",
            required: true,
            public: false,
            i18nLabel: "Enter API Key",
            i18nDescription:
                "Generate API Key and provide here to generate GIF's on the go!",
        });
        configurationExtend.slashCommands.provideSlashCommand(
            new OneGifCommand(this)
        );

        await configurationExtend.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new GifEndpoint(this)],
        });
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        this.getLogger().log("Executing BlockActionHandler...");
        const handler = new BlockActionHandler(this, context, this.getLogger());

        return await handler.handle();
    }
}
