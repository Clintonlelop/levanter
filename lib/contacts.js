const fs = require('fs-extra')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const VCF_PATH = path.join(ROOT, 'contacts.vcf')
const INDEX_PATH = path.join(ROOT, 'saved.json')

async function ensureFiles() {
  await fs.ensureFile(VCF_PATH)
  if (!(await fs.pathExists(INDEX_PATH))) {
    await fs.writeJson(INDEX_PATH, {}, { spaces: 2 })
  }
}

function normalizeNumber(raw) {
  if (!raw) return ''
  // remove non-digit characters
  const digits = String(raw).replace(/\D+/g, '')
  return digits
}

function buildVCard(name, number) {
  const fn = (name && String(name).trim()) || number || ''
  const tel = number && !number.startsWith('+') ? '+' + number : number
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fn}`,
    `TEL;TYPE=CELL:${tel}`,
    'END:VCARD',
    '',
  ].join('\n')
}

async function saveIfNew(rawNumber, displayName) {
  try {
    await ensureFiles()
    const num = normalizeNumber(rawNumber)
    if (!num) return false

    const idx = await fs.readJson(INDEX_PATH)
    if (idx && idx[num]) return false

    const vcard = buildVCard(displayName || num, num)
    await fs.appendFile(VCF_PATH, vcard, 'utf8')

    idx[num] = {
      savedAt: new Date().toISOString(),
      name: displayName || null,
    }
    await fs.writeJson(INDEX_PATH, idx, { spaces: 2 })

    return true
  } catch (e) {
    try { console.error('contacts.saveIfNew error', e && e.stack ? e.stack : e) } catch (_) {}
    return false
  }
}

module.exports = {
  saveIfNew,
  VCF_PATH,
  INDEX_PATH,
}
