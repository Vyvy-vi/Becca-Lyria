import axios from "axios";
import { MessageEmbed } from "discord.js";
import { JokeInt } from "../../../interfaces/commands/games/JokeInt";
import { SlashHandlerType } from "../../../interfaces/slash/SlashHandlerType";
import { beccaErrorHandler } from "../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../commands/errorEmbedGenerator";

export const handleJoke: SlashHandlerType = async (Becca, interaction) => {
  try {
    const joke = await axios.get<JokeInt>("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Becca Lyria (https://www.beccalyria.com)",
      },
    });

    if (!joke.data || joke.data.status !== 200) {
      await interaction.editReply({
        content: "I am not in the mood for humour right now.",
      });
      return;
    }

    const jokeEmbed = new MessageEmbed();
    jokeEmbed.setColor(Becca.colours.default);
    jokeEmbed.setTitle("Perhaps this will entertain you...");
    jokeEmbed.setDescription(joke.data.joke);
    jokeEmbed.setTimestamp();
    await interaction.editReply({ embeds: [jokeEmbed] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "joke command",
      err,
      interaction.guild?.name
    );
    await interaction
      .reply({
        embeds: [errorEmbedGenerator(Becca, "joke", errorId)],
        ephemeral: true,
      })
      .catch(async () =>
        interaction.editReply({
          embeds: [errorEmbedGenerator(Becca, "joke", errorId)],
        })
      );
  }
};