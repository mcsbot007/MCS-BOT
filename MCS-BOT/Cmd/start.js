const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "start",
        version: "1.6.0",
        author: "MOHAMMAD-BADOL",
        countDown: 5,
        role: 0,
        description: "বটের মেইন মেনু এবং পরিচিতি",
        category: "System",
        guide: "{pn}",
        prefix: true
    },

    run: async (bot, msg, args) => {
        const { chat, from, message_id } = msg;
        const uptime = process.uptime();
        
        // আপটাইম ক্যালকুলেশন
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // সময় এবং তারিখ (বাংলাদেশ টাইম)
        const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
        const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");

        const welcomeText = 
`👋 **হ্যালো, ${from.first_name}!**

✨ **আপনার তথ্য:**
┣━━ 🆔 আইডি: \`${from.id}\`
┗━━ 👤 নাম: ${from.first_name}

📊 **বট স্ট্যাটাস:**
┣━━ ⏳ আপটাইম: ${hours}h ${minutes}m ${seconds}s
┣━━ 🕒 সময়: ${time}
┣━━ 📅 তারিখ: ${date}
┗━━ 🛠️ মোট কমান্ড: ${Object.keys(global.COMMANDS).length}`;

        // ইনলাইন বাটন (শুধুমাত্র ৩টি বাটন)
        const options = {
            reply_to_message_id: message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👥 গ্রুপ ১', url: 'https://t.me/BADOLBOTGC' },
                        { text: '👥 গ্রুপ ২', url: 'https://t.me/mreditorzone' }
                    ],
                    [
                        { text: '👨‍💻 ডেভেলপার', url: `tg://user?id=6954597258` }
                    ]
                ]
            }
        };

        try {
            const photoUrl = "https://i.getimg.ai/generated/785/1700/800x400.jpg"; 
            await bot.sendPhoto(chat.id, photoUrl, {
                caption: welcomeText,
                ...options
            });
        } catch (err) {
            await bot.sendMessage(chat.id, welcomeText, options);
        }
    }
};
