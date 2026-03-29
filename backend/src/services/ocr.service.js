const Tesseract = require('tesseract.js');
const axios     = require('axios');
const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const logger    = require('../utils/logger');

async function extractReceiptData(filePathOrUrl) {
  let localPath = filePathOrUrl;
  let tempFile  = null;

  // Cloudinary returns a URL — download to temp file first
  if (filePathOrUrl.startsWith('http')) {
    try {
      const resp = await axios.get(filePathOrUrl, { responseType: 'arraybuffer', timeout: 10000 });
      tempFile   = path.join(os.tmpdir(), `ocr_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, resp.data);
      localPath  = tempFile;
    } catch (err) {
      logger.warn(`Could not download receipt for OCR: ${err.message}`);
      return _empty();
    }
  }

  try {
    const { data } = await Tesseract.recognize(localPath, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text')
          logger.debug(`OCR: ${Math.round(m.progress * 100)}%`);
      },
    });
    const raw = data.text || '';
    return {
      amount:      extractAmount(raw),
      date:        extractDate(raw),
      merchant:    extractMerchant(raw),
      category:    guessCategory(raw),
      description: extractDescription(raw),
      raw:         raw.slice(0, 2000),
    };
  } catch (err) {
    logger.error(`OCR error: ${err.message}`);
    return _empty();
  } finally {
    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

function _empty() {
  return { amount: null, date: null, merchant: null, category: null, description: null, raw: '' };
}

function extractAmount(text) {
  const patterns = [
    /(?:total|amount due|grand total|subtotal|balance)[^\d]*(\d{1,6}[.,]\d{2})/i,
    /\$\s*(\d{1,6}[.,]\d{2})/,
    /(\d{1,6}[.,]\d{2})\s*(?:USD|EUR|GBP|INR|CAD|AUD)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parseFloat(m[1].replace(',', '.'));
  }
  return null;
}

function extractDate(text) {
  const patterns = [
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/,
    /\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4}/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[0].trim();
  }
  return null;
}

function extractMerchant(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean)[0]?.slice(0, 80) || null;
}

function guessCategory(text) {
  const t = text.toLowerCase();
  const rules = [
    [/hotel|motel|inn|airbnb|resort|lodging/,                 'Accommodation'],
    [/flight|airline|airways|airport|air ticket/,             'Travel'],
    [/uber|lyft|taxi|cab|ola|grab|metro|train|bus/,           'Transport'],
    [/restaurant|cafe|coffee|food|dining|lunch|dinner|pizza/, 'Meals'],
    [/office|stationery|supplies|amazon|staples/,             'Office Supplies'],
    [/medical|pharmacy|clinic|hospital|health/,               'Medical'],
    [/internet|phone|mobile|telecom|broadband/,               'Communication'],
    [/training|course|udemy|coursera|seminar|conference/,     'Training'],
  ];
  for (const [pattern, category] of rules) {
    if (pattern.test(t)) return category;
  }
  return 'Miscellaneous';
}

function extractDescription(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3).join(' ').slice(0, 200) || null;
}

module.exports = { extractReceiptData };