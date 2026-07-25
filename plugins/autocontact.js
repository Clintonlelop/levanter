const { bot } = require('../lib/')
const contacts = require('../lib/contacts')

// Auto-save contacts.vcf for new incoming private messages
bot(
  {
    pattern: '.*',
    fromMe: false,
    desc: 'Auto-save contacts from private messages',
    type: 'autocontact',
  },
  async (message) => {
    try {
      // Many plugins use message.isGroup; respect that if available
      if (message.isGroup) return

      const key = message.key || {}
      // ignore messages sent by this client
      if (key.fromMe) return

      const remote = message.jid || key.remoteJid || ''
      if (!remote) return
      // ignore group JIDs
      if (String(remote).endsWith('@g.us')) return

      const number = String(remote).split('@')[0]
      // try multiple locations for display name, fall back to number
      const display =
        message.pushName || message.pushname || (message.contact && message.contact.vname) || ''

      // fire and forget; don't block or throw
      contacts.saveIfNew(number, display).catch(() => {})
    } catch (e) {
      try { console.error('autocontact plugin error', e && e.stack ? e.stack : e) } catch (_) {}
    }
  }
)
