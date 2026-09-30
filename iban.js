// Shared IBAN logic (ISO 13616, country-neutral).
// National structure (BBAN layout, national check digits) lives in the
// country modules ibanITA.js / ibanES.js.

const IBAN = (function () {
  // Expand rearranged string to digits, A=10 ... Z=35
  function expandToDigits(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      result += char >= '0' && char <= '9'
        ? char
        : (char.charCodeAt(0) - 'A'.charCodeAt(0) + 10).toString();
    }
    return result;
  }

  // ISO 7064 MOD-97-10. Computed per digit to avoid 30+ digit integer overflow.
  function mod97(str) {
    const digits = expandToDigits(str);
    let remainder = 0;
    for (let i = 0; i < digits.length; i++) {
      remainder = (remainder * 10 + parseInt(digits[i], 10)) % 97;
    }
    return remainder;
  }

  // countryCode: 2-letter ISO code (e.g. 'IT'), bban: national part (no check digits)
  function calculateIbanCheckDigits(countryCode, bban) {
    const rearranged = bban + countryCode + '00';
    const checkDigits = 98 - mod97(rearranged);
    return checkDigits.toString().padStart(2, '0');
  }

  function randomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  return {
    calculateIbanCheckDigits,
    randomDigits
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IBAN;
}
