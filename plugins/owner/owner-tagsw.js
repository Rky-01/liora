import { uploader } from "../../lib/uploader.js";

let handler = async (m, { conn, text }) => {
    try {
        await global.loading(m, conn);
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || "";
        let content = {};
        let groups = Object.keys(conn.chats)
            .filter((jid) => jid.endsWith("@g.us"))
            .slice(0, 5);
        if (!groups.length) return m.reply("🥐 *Bot tidak ada di grup manapun~*");

        if (mime) {
            let media = await q.download();
            if (!media) return m.reply("🥐 *Gagal unduh media!*");
            let url = await uploader(media).catch(() => null);
            if (!url) return m.reply("🍰 *Upload gagal, coba lagi ya~*");
            if (/image/.test(mime)) {
                content.image = { url };
                if (text) content.caption = text;
            } else if (/video/.test(mime)) {
                content.video = { url };
                if (text) content.caption = text;
            } else if (/audio/.test(mime)) {
                content.audio = { url };
                content.mimetype = mime;
                content.ptt = true;
            } else return m.reply("🍜 *Jenis file belum didukung~*");
        } else {
            if (!text) return m.reply("🍩 *Kirim teksnya*");
            content.text = text;
        }
        await conn.sendStatusMentions(content, groups);
        m.reply(`🍕 *Status mention berhasil dikirim ke ${groups.length} grup* 🧃`);
    } catch (e) {
        console.error(e);
        m.reply("🍔 *Gagal mengirim status mentions!*\n" + e.message);
    } finally {
        await global.loading(m, conn, true);
    }
};

handler.help = ["tagsw"];
handler.tags = ["owner"];
handler.command = /^(tagsw)$/i;
handler.owner = true;

export default handler;
