import { fetch } from "liora-lib";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || typeof text !== "string") {
        return m.reply(
            `Please enter a query for Riple AI.\n› Example: ${usedPrefix}${command} sekarang jam berapa`
        );
    }

    try {
        await global.loading(m, conn);

        const apiUrl = `https://api.nekolabs.my.id/ai/ripleai?text=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl, { method: "GET" });

        if (!response.ok) {
            return m.reply("Failed to connect to Riple AI. Please try again later.");
        }

        const json = await response.json();
        const replyText = json?.result;

        if (!replyText) {
            return m.reply("No response received from Riple AI.");
        }

        await conn.sendMessage(m.chat, { text: `Riple AI:\n${replyText.trim()}` }, { quoted: m });
    } catch (error) {
        console.error(error);
        m.reply("An error occurred: " + error.message);
    } finally {
        await global.loading(m, conn, true);
    }
};

handler.help = ["ripleai"];
handler.tags = ["ai"];
handler.command = /^(ripleai)$/i;

export default handler;
