const os = require('os');
const moment = require('moment-timezone');

module.exports.config = {
    name: "uptime",
    credits: "MOHAMMAD-BADOL",
    aliases: ["up"],
    prefix: true,
    permission: 0,
    description: "Display bot and system status.",
    tags: ["info", "system"]
};

module.exports.run = async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const imageUrl = "https://files.catbox.moe/qwdke3.jpg";

    
    const author = "MOHAMMAD-BADOL"; 
    const botName = transformText(global.CONFIG?.BOT_SETTINGS?.NAME || "LIKHON BOT");
    const prefix = transformText(global.PREFIX || "/");
    const bdTime = transformText(
        moment().tz("Asia/Dhaka").format("MM/DD/YYYY, h:mm:ss A")
    );

    const ramUsed = (os.totalmem() - os.freemem()) / (1024 ** 3);
    const ramTotal = os.totalmem() / (1024 ** 3);

    const uptimeMs = Date.now() - global.botStartTime;
    const uptimeFormatted = transformText(formatUptime(uptimeMs));

    const startTime = Date.now();

    getCpuLoad(async (cpuLoad) => {
        const ping = transformText(`${Date.now() - startTime} ms`);
        const cpuLoadFormatted = transformText(cpuLoad + " %");
        const ramUsedFormatted = transformText(
            `${ramUsed.toFixed(2)} GB / ${ramTotal.toFixed(2)} GB`
        );

        
        const output = `
╭━━━━━━❰  𝐁𝐎𝐓 - 𝐈𝐍𝐅𝐎  ❱━━━━━━╮
┃
┃ 👤 𝐀𝐮𝐭𝐡𝐨𝐫: ${author}
┃
┃ 🤖 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${botName}
┃
┃ ⏹ 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}
┃
┃ 🕒 𝐁𝐃 𝐓𝐢𝐦𝐞: ${bdTime}
┃
┃ ⏱ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeFormatted}
┃
┃ 📡 𝐏𝐢𝐧𝐠: ${ping}
┃
┃ 🧠 𝐂𝐏𝐔 𝐋𝐨𝐚𝐝: ${cpuLoadFormatted}
┃
┃ 📦 𝐑𝐀𝐌 𝐔𝐬𝐞𝐝: ${ramUsedFormatted}
┃
┃ 🖥 𝐒𝐞𝐫𝐯𝐞𝐫: 𝐎𝐧𝐥𝐢𝐧𝐞 ✅
┃
╰━━━━━━━━━━━━━━━❍
        `.trim();

        try {
            await bot.sendPhoto(chatId, imageUrl, {
                caption: output,
                reply_to_message_id: messageId
            });
        } catch (err) {
            await bot.sendMessage(chatId, output, {
                reply_to_message_id: messageId
            });
        }
    });
};

function transformText(text) {
    const map = {
        'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝','K':'𝗞','L':'𝗟','M':'𝗠',
        'N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧','U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭',
        'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷','k':'𝗸','l':'𝗹','m':'𝗺',
        'n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁','u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇',
        '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'
    };
    let out = '';
    for (const ch of String(text)) out += map[ch] || ch;
    return out;
}

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${d}d ${h}h ${m}m ${sec}s`;
}

function getCpuLoad(callback) {
    const start = os.cpus().map(c => c.times);
    setTimeout(() => {
        const end = os.cpus().map(c => c.times);
        let idle = 0, total = 0;
        for (let i = 0; i < start.length; i++) {
            const idleDiff = end[i].idle - start[i].idle;
            const totalDiff = (end[i].user - start[i].user) + (end[i].nice - start[i].nice) + (end[i].sys - start[i].sys) + (end[i].irq - start[i].irq) + idleDiff;
            idle += idleDiff;
            total += totalDiff;
        }
        const cpu = 100 * (total - idle) / total;
        callback(cpu.toFixed(2));
    }, 300); 
            }
