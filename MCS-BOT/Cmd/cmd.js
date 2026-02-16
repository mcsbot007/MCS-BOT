const fs = require('fs/promises');
const path = require('path');
const axios = require('axios'); 

module.exports.config = {
    name: "cmd",
    credits: "MOHAMMAD-BADOL",
    aliases: ["command", "c"],
    prefix: true,
    permission: 2, 
    description: "কমান্ড ইন্সটল, আনলোড এবং লোড করার সিস্টেম",
    category: "system",
    guide: "{pn} install <filename.js>"
};

const pendingConfirmation = new Map();
// আপনার নতুন পাথ অনুযায়ী সেট করা হয়েছে
const COMMANDS_DIR = path.join(process.cwd(), 'MCS-BOT', 'Cmd');

// গ্লোবাল লোডার ফাংশন ব্যবহার
const loadCommand = global.loadCommand;
const unloadCommand = global.unloadCommand;

module.exports.run = async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const senderId = msg.from.id;
    
    // আপনার মেইন ফাইলের AUTHOR_ID এবং CONFIG চেক
    const botOwnerId = 6954597258; // আপনার সংরক্ষিত আইডি
    const currentPrefix = global.CONFIG?.BOT_SETTINGS?.PREFIX || '/';

    if (senderId !== botOwnerId) {
        return bot.sendMessage(chatId, `❌ শুধুমাত্র বট মালিক এই কমান্ডটি ব্যবহার করতে পারবেন।`, { reply_to_message_id: messageId });
    }

    const subCommand = args[0] ? args[0].toLowerCase() : null;
    const target = args[1];

    // কনফার্মেশন হ্যান্ডলার (Reply Y/N)
    if (msg.reply_to_message) {
        const key = `${chatId}-${msg.reply_to_message.message_id}`;
        if (pendingConfirmation.has(key)) {
            const data = pendingConfirmation.get(key);
            pendingConfirmation.delete(key);
            const userReply = msg.text.trim().toLowerCase();
            
            if (userReply === 'y') {
                if (data.fileCode) return handleInstallCode(bot, chatId, messageId, data.targetFilename, data.fileCode, data.isUpdate);
                if (data.fileUrl) return handleInstallURL(bot, chatId, messageId, data.targetFilename, data.fileUrl, data.isUpdate);
            } else {
                return bot.sendMessage(chatId, `✅ বাতিল করা হয়েছে।`);
            }
        }
    }

    if (!subCommand) {
        const usage = `⚠️ **ব্যবহার:**\n\n` +
            `🔹 \`${currentPrefix}cmd install <নাম.js> [কোড]\` (সরাসরি কোড)\n` +
            `🔹 \`${currentPrefix}cmd install <নাম.js>\` (ফাইল রিপ্লাই)\n` +
            `🔹 \`${currentPrefix}cmd uninstall <নাম>\` (ডিলিট)\n` +
            `🔹 \`${currentPrefix}cmd load <নাম>\` (রিলোড)\n` +
            `🔹 \`${currentPrefix}cmd loadall\` (সব রিলোড)`;
        return bot.sendMessage(chatId, usage, { reply_to_message_id: messageId, parse_mode: 'Markdown' });
    }

    // --- Install Sub-command ---
    if (subCommand === 'install') {
        if (!target) return bot.sendMessage(chatId, `⚠️ ফাইলের নাম দিন।`);
        const targetFilename = target.endsWith('.js') ? target : `${target}.js`;
        const filePath = path.join(COMMANDS_DIR, targetFilename);
        const isUpdate = await fileExists(filePath);

        if (args.length > 2) {
            const fileCode = args.slice(2).join(' ').trim();
            if (isUpdate) {
                const confirmationMsg = await bot.sendMessage(chatId, `⚠️ \`${targetFilename}\` আগে থেকেই আছে। ওভাররাইট করতে চাইলে এই মেসেজে 'Y' লিখে রিপ্লাই দিন।`, { parse_mode: 'Markdown' });
                pendingConfirmation.set(`${chatId}-${confirmationMsg.message_id}`, { targetFilename, fileCode, isUpdate: true });
                return;
            }
            return handleInstallCode(bot, chatId, messageId, targetFilename, fileCode, false);
        } else if (msg.reply_to_message && msg.reply_to_message.document) {
            const fileUrl = await bot.getFileLink(msg.reply_to_message.document.file_id);
            if (isUpdate) {
                const confirmationMsg = await bot.sendMessage(chatId, `⚠️ ফাইলটি আগে থেকেই আছে। আপডেট করতে 'Y' লিখে রিপ্লাই দিন।`);
                pendingConfirmation.set(`${chatId}-${confirmationMsg.message_id}`, { targetFilename, fileUrl, isUpdate: true });
                return;
            }
            return handleInstallURL(bot, chatId, messageId, targetFilename, fileUrl, false);
        }
        return bot.sendMessage(chatId, `⚠️ কোড দিন অথবা একটি .js ফাইলে রিপ্লাই দিয়ে কমান্ডটি ব্যবহার করুন।`);
    }

    // --- Load Sub-command ---
    if (subCommand === 'load') {
        if (!target) return bot.sendMessage(chatId, `⚠️ কমান্ডের নাম দিন।`);
        return handleLoad(bot, chatId, messageId, target);
    }

    // --- Unload Sub-command ---
    if (subCommand === 'unload') {
        if (!target) return bot.sendMessage(chatId, `⚠️ কমান্ডের নাম দিন।`);
        return handleUnload(bot, chatId, messageId, target);
    }

    // --- Uninstall Sub-command ---
    if (subCommand === 'uninstall') {
        if (!target) return bot.sendMessage(chatId, `⚠️ কমান্ডের নাম দিন।`);
        const filename = target.endsWith('.js') ? target : `${target}.js`;
        const cmdName = global.ALIASES[target] || target;
        try {
            const filePath = path.join(COMMANDS_DIR, filename);
            if (!await fileExists(filePath)) return bot.sendMessage(chatId, `❌ ফাইলটি পাওয়া যায়নি।`);
            if (global.COMMANDS[cmdName]) unloadCommand(cmdName);
            await fs.unlink(filePath);
            return bot.sendMessage(chatId, `🗑️ \`${target}\` কমান্ড এবং ফাইলটি ডিলিট করা হয়েছে।`);
        } catch (e) {
            return bot.sendMessage(chatId, `❌ এরর: ${e.message}`);
        }
    }

    // --- Load All ---
    if (subCommand === 'loadall') {
        const files = await fs.readdir(COMMANDS_DIR);
        let count = 0;
        for (const file of files) {
            if (file.endsWith('.js')) {
                try { loadCommand(file.replace('.js', '')); count++; } catch (e) {}
            }
        }
        return bot.sendMessage(chatId, `✅ মোট ${count} টি কমান্ড রিলোড করা হয়েছে।`);
    }
};

// --- Helper Functions ---

async function handleInstallURL(bot, chatId, replyToMessageId, targetFilename, fileUrl, isUpdate) {
    const filePath = path.join(COMMANDS_DIR, targetFilename);
    const commandName = targetFilename.replace('.js', '');
    try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        await fs.writeFile(filePath, Buffer.from(response.data));
        loadCommand(commandName);
        return bot.sendMessage(chatId, `✅ \`${commandName}\` ${isUpdate ? 'আপডেট' : 'ইন্সটল'} এবং লোড হয়েছে।`);
    } catch (e) {
        return bot.sendMessage(chatId, `❌ এরর: ${e.message}`);
    }
}

async function handleInstallCode(bot, chatId, replyToMessageId, targetFilename, fileCode, isUpdate) {
    const filePath = path.join(COMMANDS_DIR, targetFilename);
    const commandName = targetFilename.replace('.js', '');
    try {
        await fs.writeFile(filePath, fileCode);
        loadCommand(commandName);
        return bot.sendMessage(chatId, `✅ \`${commandName}\` ${isUpdate ? 'আপডেট' : 'ইন্সটল'} এবং লোড হয়েছে।`);
    } catch (e) {
        return bot.sendMessage(chatId, `❌ এরর: ${e.message}`);
    }
}

async function handleLoad(bot, chatId, messageId, target) {
    const name = target.replace('.js', '');
    try {
        loadCommand(name);
        return bot.sendMessage(chatId, `✅ \`${name}\` লোড করা হয়েছে।`);
    } catch (e) {
        return bot.sendMessage(chatId, `❌ লোড করতে ব্যর্থ: ${e.message}`);
    }
}

async function handleUnload(bot, chatId, messageId, target) {
    const name = global.COMMANDS[target] ? target : global.ALIASES[target];
    if (!name) return bot.sendMessage(chatId, `❌ কমান্ডটি বর্তমানে লোড করা নেই।`);
    unloadCommand(name);
    return bot.sendMessage(chatId, `✅ \`${name}\` আনলোড করা হয়েছে।`);
}

async function fileExists(filePath) {
    try { await fs.access(filePath); return true; } catch { return false; }
}
