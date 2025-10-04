let handler = async (m, { conn, groupMetadata }) => {
    try {
        let code = await conn.groupInviteCode(m.chat);
        let link = `https://chat.whatsapp.com/${code}`;
        let teks = `🍡 *Nama Grup:* ${groupMetadata.subject}
🍰 *ID Grup:* ${m.chat}

🍬 *Link Undangan Grup:*
${link}`;

        await m.reply(teks);
    } catch (e) {
        console.error(e);
        m.reply("🍪 *Gagal mengambil link grup.*");
    }
};

handler.help = ["grouplink"];
handler.tags = ["group"];
handler.command = /^(grouplink|link)$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;