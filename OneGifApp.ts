import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { OneGifCommand } from "./commands/one-gif";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";

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
    }
}
