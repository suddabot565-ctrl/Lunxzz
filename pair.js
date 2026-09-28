const jid = jidPart;

if (!jid || !jid.endsWith('@newsletter')) {
    await socket.sendMessage(
        sender,
        {
            text: '❗ Invalid JID. Example: 120363402094635383@newsletter'
        },
        { quoted: msg }
    );
    break;
}

let emojis = [];

if (emojisPart) {
    emojis = emojisPart.includes(',')
        ? emojisPart.split(',').map(e => e.trim())
        : emojisPart.split(/\s+/).map(e => e.trim());

    if (emojis.length > 20) {
        emojis = emojis.slice(0, 20);
    }
}

try {
    if (typeof socket.newsletterFollow === 'function') {
        await socket.newsletterFollow(jid);
    }

    await addNewsletterToMongo(jid, emojis);

    const emojiText = emojis.length
        ? emojis.join(' ')
        : '(default set)';

    // Meta mention for botName
    const metaQuote = {
        key: {
            remoteJid: "status@broadcast",
            participant: "0@s.whatsapp.net",
            fromMe: false,
            id: "META_AI_CFN"
        },
        message: {
            contactMessage: {
                displayName: botName,
                vcard: `BEGIN:VCARD
VERSION:3.0
N:${botName};;;;
FN:${botName}
ORG:Meta Platforms
TEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002
END:VCARD`
            }
        }
    };

    let imagePayload = String(logo).startsWith('http')
        ? { url: logo }
        : fs.readFileSync(logo);

    await socket.sendMessage(
        sender,
        {
            image: imagePayload,

            caption: `✅ Channel followed and saved!

JID: ${jid}
Emojis: ${emojiText}
Saved by: @${senderIdSimple}`,

            footer: `📌 ${botName} FOLLOW CHANNEL`,

            mentions: [nowsender],

            buttons: [
                {
                    buttonId: `${config.PREFIX}menu`,
                    buttonText: {
                        displayText: "🚪 𝐌𝙴𝙽𝚄"
                    },
                    type: 1
                }
            ],

            headerType: 4
        },
        {
            quoted: metaQuote
        }
    );

} catch (e) {
    console.error('cfn error', e);

    await socket.sendMessage(
        sender,
        {
            text: `❌ Failed to save/follow channel: ${e.message || e}`
        },
        { quoted: msg }
    );
}

break;