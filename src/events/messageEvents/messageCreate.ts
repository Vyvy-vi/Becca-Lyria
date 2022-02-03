import { Message } from "discord.js";
import { getFixedT } from "i18next";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { automodPhish } from "../../listeners/automod/automodPhish";
import { automodListener } from "../../listeners/automodListener";
import { emoteListener } from "../../listeners/emoteListener";
import { heartsListener } from "../../listeners/heartsListener";
import { levelListener } from "../../listeners/levelListener";
import { sassListener } from "../../listeners/sassListener";
import { triggerListener } from "../../listeners/triggerListener";
import { naomiAntiphish } from "../../modules/naomi/naomiAntiphish";
import { naomiPurgeData } from "../../modules/naomi/naomiPurgeData";
import { naomiUnregisterCommand } from "../../modules/naomi/naomiUnregisterCommand";
import { naomiViewCommands } from "../../modules/naomi/naomiViewCommands";
import { getSettings } from "../../modules/settings/getSettings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";
import { getMessageLanguage } from "../../utils/getLangCode";
import { registerCommands } from "../../utils/registerCommands";

/**
 * Handles the onMessage event. Validates that the message did not come from
 * another bot, then passes the message through to the listeners and command handler.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {Message} message The message object received in the gateway event.
 */
export const messageCreate = async (
  Becca: BeccaLyria,
  message: Message
): Promise<void> => {
  try {
    const { author, channel, guild } = message;

    if (author.bot) {
      return;
    }

    if (!guild || channel.type === "DM") {
      return;
    }
    const lang = getMessageLanguage(message);
    const t = getFixedT(lang);

    const serverConfig = await getSettings(Becca, guild.id, guild.name);

    if (!serverConfig) {
      return;
    }

    const isScam = await automodPhish(Becca, message, t, serverConfig);

    if (isScam) {
      return;
    }

    await heartsListener.run(Becca, message, t, serverConfig);
    await automodListener.run(Becca, message, t, serverConfig);
    await levelListener.run(Becca, message, t, serverConfig);
    await sassListener.run(Becca, message, t, serverConfig);
    await triggerListener.run(Becca, message, t, serverConfig);
    await emoteListener.run(Becca, message, t, serverConfig);

    if (
      message.author.id === Becca.configs.ownerId &&
      message.content.startsWith("Naomi")
    ) {
      await message.reply("Heya, Naomi!");
      if (message.content === "Naomi register") {
        await registerCommands(Becca);
        await message.reply("Registered commands!");
        return;
      }
      if (message.content.startsWith("Naomi unregister")) {
        await naomiUnregisterCommand(Becca, message);
        return;
      }
      if (message.content === "Naomi view") {
        await naomiViewCommands(Becca, message);
        return;
      }
      if (message.content.startsWith("Naomi purge")) {
        await naomiPurgeData(Becca, message);
        return;
      }
      if (message.content.startsWith("Naomi fish")) {
        await naomiAntiphish(Becca, message);
        return;
      }
    }
    Becca.pm2.metrics.events.mark();
  } catch (err) {
    await beccaErrorHandler(
      Becca,
      "message send event",
      err,
      message.guild?.name,
      message
    );
  }
};
