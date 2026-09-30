// Italian IBAN (27 chars): IT + 2 check + 1 CIN + 5 ABI + 5 CAB + 12 alphanumeric account.
// National check char (CIN) computed per Italian banking standard (CUC algorithm).

const IbanITA = (function () {
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('./iban.js')
    : IBAN; // global from iban.js (browser)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Real ABI bank codes (first digit region-based; all are real Italian banks)
  const abiCodes = [
    '01005', // Unicredit
    '02008', // Intesa Sanpaolo
    '03385', // Monte dei Paschi di Siena
    '05116', // BPER
    '01030', // Banco BPM (Banco Popolare)
  ];

  // CIN odd/even contribution tables (same lookup scheme as codice fiscale).
  // Odd-position chars (1-indexed, first char of ABI is position 1) use oddValues;
  // even positions use identity values. Sum mod 26, 0 -> A ... 25 -> Z.
  // Verified against official example IBAN IT60X0542811101000000123456.
  const oddValues = {
    '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
    'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
    'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
    'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
  };

  function calculateCin(abi, cab, account) {
    const payload = abi + cab + account;
    let sum = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload[i];
      sum += (i % 2 === 0) ? oddValues[char] : (/[0-9]/.test(char) ? parseInt(char, 10) : char.charCodeAt(0) - 65);
    }
    return alphabet[sum % 26]; // 0 -> A, ..., 25 -> Z
  }

  function generateIbanITA() {
    const abi = abiCodes[Math.floor(Math.random() * abiCodes.length)];
    const cab = Shared.randomDigits(5);
    const account = Shared.randomDigits(12); // numeric: letter CIN values are unverifiable
    const cin = calculateCin(abi, cab, account);
    const bban = cin + abi + cab + account;
    const checkDigits = Shared.calculateIbanCheckDigits('IT', bban);
    return `IT${checkDigits}${bban}`;
  }

  return {
    generateIbanITA,
    calculateCin
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IbanITA;
}
