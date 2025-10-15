import { fetch, convert } from "liora-lib"
import decode from "audio-decode"

const languages = {
  1: ["id-ID", "🇮🇩 Indonesia"],
  2: ["en-US", "🇺🇸 English"],
  3: ["ja-JP", "🇯🇵 Japanese"],
  4: ["fr-FR", "🇫🇷 French"],
  5: ["fil-PH", "🇵🇭 Filipino"],
  6: ["my-MM", "🇲🇲 Burmese"],
  7: ["de-DE", "🇩🇪 German"],
  8: ["it-IT", "🇮🇹 Italian"],
  9: ["ko-KR", "🇰🇷 Korean"],
  10: ["th-TH", "🇹🇭 Thai"],
  11: ["hi-IN", "🇮🇳 Hindi"],
  12: ["ru-RU", "🇷🇺 Russian"],
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    const list = Object.entries(languages)
      .map(([num, [code, name]]) => `${num}. ${name} (${code})`)
      .join("\n")
    return m.reply(
      `Select TTS language by number + text.\n› Example: ${usedPrefix + command} 1 Halo Izumi\n\nAvailable languages:\n${list}`
    )
  }

  const num = parseInt(args[0])
  if (!languages[num]) return m.reply("Invalid language number.")

  const [langCode] = languages[num]
  const text = args.slice(1).join(" ")
  if (!text) return m.reply("Enter text to convert into speech.")

  await global.loading(m, conn)
  try {
    const apiUrl = global.API(
      "btz",
      "/api/sound/texttosound",
      { text1: text, lang: langCode },
      "apikey"
    )
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const fileUrl = json.result || json.url
    if (!fileUrl) throw new Error("No audio file returned from API.")

    const audioRes = await fetch(fileUrl)
    if (!audioRes.ok) throw new Error(`Failed to fetch audio. Status: ${audioRes.status}`)
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
    const converted = await convert(audioBuffer, {
      format: "opus",
      bitrate: "96k",
      channels: 1,
      sampleRate: 48000,
      ptt: true,
    })
    const finalBuffer =
      converted instanceof Buffer
        ? converted
        : converted?.buffer
        ? Buffer.from(converted.buffer)
        : converted?.data
        ? Buffer.from(converted.data)
        : Buffer.from(converted)
    const audioData = await decode(finalBuffer)
    const channelData = audioData.getChannelData(0)
    const bars = 64
    const blockSize = Math.floor(channelData.length / bars)
    const waveform = new Uint8Array(
      Array.from({ length: bars }, (_, i) => {
        const start = i * blockSize
        const slice = channelData.subarray(start, start + blockSize)
        let peak = 0
        for (let j = 0; j < slice.length; j++) {
          const val = Math.abs(slice[j])
          if (val > peak) peak = val
        }
        return Math.round(255 * peak)
      })
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: finalBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        waveform,
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply(`Error: ${e.message}`)
  } finally {
    await global.loading(m, conn, true)
  }
}

handler.help = ["tts"]
handler.tags = ["tools"]
handler.command = /^(tts)$/i

export default handler