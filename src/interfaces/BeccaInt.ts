import { Client, ColorResolvable, WebhookClient } from "discord.js";
import { SlashInt } from "./slash/SlashInt";

/**
 * Model used to pass around Becca's client instance with additional
 * configurations attached.
 * @property prefixData The data for server-specific prefixes.
 * @property debugHook The Discord Webhook Client for the error handler.
 * @property configs A map of the environment variables, assigned after validation.
 * @property colours Colour mappings to use in embeds.
 */
export interface BeccaInt extends Client {
  debugHook: WebhookClient;
  configs: {
    token: string;
    dbToken: string;
    whUrl: string;
    nasaKey: string;
    ownerId: string;
    love: string;
    yes: string;
    no: string;
    think: string;
    version: string;
    id: string;
    homeGuild: string;
  };
  colours: {
    default: ColorResolvable;
    success: ColorResolvable;
    warning: ColorResolvable;
    error: ColorResolvable;
  };
  commands: SlashInt[];
  responses: ResponsesInt;
}

export interface ResponsesInt {
  missing_guild: string;
  invalid_command: string;
  no_permission: string;
  owner_only: string;
  missing_param: string;
  default_mod_reason: string;
  no_mod_self: string;
  no_mod_becca: string;
}
