const fs = require('fs-extra');
const path = require('path');

// আপনার মেইন ফাইল অনুযায়ী পাথ সেট করা হয়েছে
const configPath = path.join(process.cwd(), 'MCS-Config', 'config.js');

module.exports.config = {
  name: "prefix",
  version: "1.0.5", 
  credits: "MOHAMMAD-BADOL",
  permission: 2, 
  prefix: false, // prefix ছাড়াই কাজ করবে
  description: "বটের বর্তমান প্রিফিক্স দেখা বা পরিবর্তন করা",
  category: "utility",
  usages: "/prefix [নতুন প্রিফিক্স]",
  cooldowns: 5,
};

module.exports.run = async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const senderID = msg.from.id;
    
    // আপনার সংরক্ষিত আইডি
    const AUTHOR_ID = 6954597258; 
    
    let currentConfig;
    try {
        // ক্যাশ ক্লিয়ার করে ফ্রেশ কনফিগ লোড করা
        if (require.cache[require.resolve(configPath)]) {
            delete require.cache[require.resolve(configPath)];
        }
        currentConfig = require(configPath);
    } catch (e) {
        return bot.sendMessage(
            chatId, 
            `❌ কনফিগারেশন ফাইল পাওয়া যায়নি। নিশ্চিত করুন \`MCS-Config/config.js\` ঠিক আছে কি না।`, 
            { reply_to_message_id: messageId }
        );
    }
    
    const currentPrefix = currentConfig.BOT_SETTINGS.PREFIX || '/';

    // যদি ইউজার নতুন প্রিফিক্স সেট করতে চায়
    if (args.length > 0) {
        
        // শুধুমাত্র আপনি (AUTHOR_ID) পরিবর্তন করতে পারবেন
        if (senderID !== AUTHOR_ID) { 
             return bot.sendMessage(
                chatId, 
                "❌ আপনি প্রিফিক্স পরিবর্তন করার অনুমতিপ্রাপ্ত নন।", 
                { reply_to_message_id: messageId }
            );
        }
        
        const newPrefix = args[0].trim();
        if (newPrefix.length > 5) {
             return bot.sendMessage(
                chatId, 
                "❌ প্রিফিক্সটি অনেক বড়। সর্বোচ্চ ৫ অক্ষরের মধ্যে রাখুন।", 
                { reply_to_message_id: messageId }
            );
        }
        
        try {
            // মেমোরিতে প্রিফিক্স আপডেট
            currentConfig.BOT_SETTINGS.PREFIX = newPrefix;
            
            // ফাইলে সেভ করা
            const newContent = `module.exports = ${JSON.stringify(currentConfig, null, 4)};\n`;
            fs.writeFileSync(configPath, newContent, 'utf8');
            
            // মেইন ফাইলের গ্লোবাল রিলোড ফাংশন কল করা
            if (global.reloadConfig) {
                global.reloadConfig();
            }

            await bot.sendMessage(
                chatId, 
                `✅ প্রিফিক্স পরিবর্তন সফল!\nনতুন প্রিফিক্স: \`${newPrefix}\``,
                { reply_to_message_id: messageId, parse_mode: 'Markdown' }
            );

        } catch (error) {
            console.error("❌ Prefix change failed:", error);
            return bot.sendMessage(
                chatId, 
                "❌ ফাইল সেভ করতে সমস্যা হয়েছে।", 
                { reply_to_message_id: messageId }
            );
        }
    } 
    
    // শুধু প্রিফিক্স দেখতে চাইলে
    else {
        return bot.sendMessage(
            chatId, 
            `বটের বর্তমান প্রিফিক্স: \`${currentPrefix}\``, 
            { reply_to_message_id: messageId, parse_mode: 'Markdown' }
        );
    }
};
