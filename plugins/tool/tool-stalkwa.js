let handler = async (m, { conn, text }) => {
    try {
        await global.loading(m, conn)

        let target =
            m.mentionedJid?.[0] ||
            (m.quoted?.sender) ||
            (text && /^\d+$/.test(text) ? text + "@s.whatsapp.net" : null)

        if (!target) 
            return m.reply("🍙 *Masukkan nomor, mention, atau reply user!*")

            let pnJid = target.endsWith("@s.whatsapp.net")
                ? target
                : (await conn.signalRepository.lidMapping.getPNForLID(target)) || target

            const [cek] = await conn.onWhatsApp(pnJid)
            if (!cek?.exists) return m.reply("🍩 *Nomor tidak terdaftar di WhatsApp!*")

            let userJid = cek.jid
            let lid = await conn.signalRepository.lidMapping.getLIDForPN(userJid) || cek.lid
        
        let pp = await conn.profilePictureUrl(userJid, "image")
            .catch(() => "https://qu.ax/jVZhH.jpg")
        let statusRes = await conn.fetchStatus(userJid).catch(() => null)
        let about = statusRes?.[0]?.status?.status || "Tidak tersedia"
        let lastUpdate = statusRes?.[0]?.status?.setAt
            ? formatDate(new Date(statusRes[0].status.setAt))
            : null
        let bisnis = await conn.getBusinessProfile(userJid).catch(() => null)
        let businessHours = ""
        if (bisnis?.business_hours?.business_config?.length) {
            businessHours =
                "\n🍵 *Jam Operasional:*\n" +
                bisnis.business_hours.business_config
                    .map((cfg) => {
                        let day = dayId(cfg.day_of_week)
                        let open = minuteToTime(cfg.open_time)
                        let close = minuteToTime(cfg.close_time)
                        return `*•> ${day}: ${open} - ${close}*`
                    })
                    .join("\n")
        }
        let title = bisnis?.description || bisnis?.category
            ? "🍰 WhatsApp Business"
            : "🍩 WhatsApp"

        let caption = `*${title}*
────────────────────
🍡 *User:* @${userJid.split("@")[0]}
🍙 *LID: ${lid}*

🍰 *Status: ${about}*
${about !== "Tidak tersedia" && lastUpdate ? `🕒 *Terakhir diubah: ${lastUpdate}*` : ""}
${bisnis?.description ? `🍮 *Bisnis:* ${bisnis.description}` : ""}
${bisnis?.category ? `🍧 *Kategori: ${Array.isArray(bisnis.category) ? bisnis.category.join(", ") : bisnis.category}*` : ""}
${bisnis?.email ? `🍬 *Email: ${bisnis.email}*` : ""}
${bisnis?.website?.length ? `🍭 *Website: ${bisnis.website.join(", ")}*` : ""}
${bisnis?.address ? `🍪 *Alamat: ${bisnis.address}*` : ""}
${businessHours}`.trim()

        await conn.sendFile(m.chat, pp, "profile.jpg", caption, m, null, {
            mentions: [userJid],
        })
    } catch (e) {
        console.error(e)
        m.reply("🍩 *Gagal mengambil data profil, mungkin nomornya salah atau disembunyikan~*")
    } finally {
        await global.loading(m, conn, true)
    }
}

handler.help = ["stalkwa"]
handler.tags = ["tools"]
handler.command = /^(stalkwa|getwa|cekwa)$/i

export default handler

function formatDate(date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    }).format(date) + " WIB"
}

function dayId(day) {
    const map = {
        sun: "Minggu",
        mon: "Senin",
        tue: "Selasa",
        wed: "Rabu",
        thu: "Kamis",
        fri: "Jumat",
        sat: "Sabtu",
    }
    return map[day] || day
}

function minuteToTime(minute) {
    if (!minute && minute !== 0) return "-"
    let h = Math.floor(minute / 60)
    let m = minute % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} WIB`
}