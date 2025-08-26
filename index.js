import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";

const TOKEN = "MTQwOTg0MjMxNzc2MTg0MzIyMg.Gu5Sew.8voOpIArRg-4gXbsZzfCyaJlW1fKENxSMZrlQY";

// Keyword dasar (bahaya umum)
const suspiciousKeywords = [
  "os.execute",
  "io.popen",
  "io.open",
  "socket.http",
  "socket.tcp",
  "socket.udp",
  "http.request",
  "game.HttpPost",
  "getclipboard",
  "writefile",
  "readfile",
  "syn.request",
  "webhook",
  "token",
  "post",
  "loadstring",
  "load",
  "string.char"
];

// Pola kombinasi berbahaya (lebih akurat)
const dangerousCombos = [
  ["getclipboard", "http.request"],
  ["getclipboard", "syn.request"],
  ["os.getenv", "http"],
  ["writefile", "webhook"]
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`✅ Bot login sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.attachments.size > 0) {
    for (const attachment of msg.attachments.values()) {
      if (attachment.name.endsWith(".lua")) {
        msg.reply("🔎 Memindai file Lua...");

        try {
          const res = await axios.get(attachment.url);
          const code = res.data;

          let findings = [];
          suspiciousKeywords.forEach((kw) => {
            if (code.toLowerCase().includes(kw.toLowerCase())) {
              findings.push(kw);
            }
          });

          // cek kombinasi berbahaya
          let comboFindings = [];
          dangerousCombos.forEach((combo) => {
            if (combo.every((kw) => code.toLowerCase().includes(kw.toLowerCase()))) {
              comboFindings.push(combo.join(" + "));
            }
          });

          if (comboFindings.length > 0) {
            msg.reply(
              `🚨 File **${attachment.name}** SANGAT BERBAHAYA!\nDitemukan pola: ${comboFindings.join(", ")}`
            );
          } else if (findings.length > 0) {
            msg.reply(
              `⚠️ File **${attachment.name}** mencurigakan!\nKeyword terdeteksi: ${findings.join(", ")}`
            );
          } else {
            msg.reply(`✅ File **${attachment.name}** aman, tidak ada tanda berbahaya.`);
          }
        } catch (err) {
          console.error(err);
          msg.reply("❌ Gagal download file untuk dipindai.");
        }
      }
    }
  }
});

client.login(TOKEN);

