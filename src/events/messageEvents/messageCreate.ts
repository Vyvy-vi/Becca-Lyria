import { Message } from "discord.js";
import { BeccaInt } from "../../interfaces/BeccaInt";
import { beccaMentionListener } from "../../listeners/beccaMentionListener";
import { heartsListener } from "../../listeners/heartsListener";
import { levelListener } from "../../listeners/levelListener";
import { linksListener } from "../../listeners/linksListener";
import { thanksListener } from "../../listeners/thanksListener";
import { handleDms } from "../../modules/handleDms";
import { getSettings } from "../../modules/settings/getSettings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";
import { sleep } from "../../utils/sleep";

/**
 * Handles the onMessage event. Validates that the message did not come from
 * another bot, then passes the message through to the listeners and command handler.
 * @param Becca Becca's Client instance
 * @param message The message object received by the gateway event
 */
export const messageCreate = async (
  Becca: BeccaInt,
  message: Message
): Promise<void> => {
  try {
    const { author, channel, content, guild } = message;
    const { commands } = Becca;

    if (author.bot) {
      return;
    }

    if (!guild || channel.type === "DM") {
      await handleDms(Becca, message);
      return;
    }

    const serverConfig = await getSettings(Becca, guild.id, guild.name);

    if (!serverConfig) {
      throw new Error("Could not get server configuration.");
    }

    await heartsListener.run(Becca, message, serverConfig);
    await thanksListener.run(Becca, message, serverConfig);
    await linksListener.run(Becca, message, serverConfig);

    const prefix = "becca!";

    if (!content.startsWith(prefix)) {
      await levelListener.run(Becca, message, serverConfig);
      await beccaMentionListener.run(Becca, message, serverConfig);
      return;
    }

    for (const command of commands) {
      const [commandCall] = message.content.toLowerCase().split(" ");
      if (commandCall === prefix + command.name) {
        await message.channel.sendTyping();
        await sleep(3000);
        const response = await command.run(Becca, message, serverConfig);
        if (typeof response.content === "string") {
          await message.channel.send(response.content);
        } else {
          await message.channel.send({ embeds: [response.content] });
        }
        if (response.success) {
          await message.react(Becca.configs.yes);
        } else {
          await message.react(Becca.configs.no);
        }
        break;
      }
    }
  } catch (err) {
    beccaErrorHandler(
      Becca,
      "message send event",
      err,
      message.guild?.name,
      message
    );
  }
};