module.exports = {

    config: {

        name: "left",

        eventType: "left_chat_member",

        author: "MOHAMMAD-BADOL",

        description: "কেউ গ্রুপ থেকে চলে গেলে বা রিমুভ হলে মেসেজ দিবে"

    },

    run: async (bot, msg) => {

        const chatId = msg.chat.id;

        const user = msg.left_chat_member;

        const groupName = msg.chat.title;

        // যদি বট নিজে লিভ নেয় বা রিমুভ হয় তবে মেসেজ দিবে না

        if (user.id === (await bot.getMe()).id) return;

        const name = user.first_name;

        const leftMsg = `👋 **বিদায়, ${name}!**\n` +

                        `━━━━━━━━━━━━━━━\n` +

                        `আপনি **${groupName}** থেকে বিদায় নিয়েছেন। আমরা আপনাকে মিস করবো! 🥺`;

        try {

            await bot.sendMessage(chatId, leftMsg, { parse_mode: 'Markdown' });

        } catch (e) {

            console.error("Left Error:", e);

        }

    }

};