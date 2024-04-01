import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { OneGifCommand } from "./commands/GenGifCommand";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";
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
        // Get the API Key from the user
        // TODO: Instead of API Key take API_URL of `gif_service`
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

        // Initialize the Slash Commands
        configurationExtend.slashCommands.provideSlashCommand(
            new OneGifCommand(this)
        );

        // Register the Webhooks
        await configurationExtend.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new GifEndpoint(this)],
        });
    }
}
