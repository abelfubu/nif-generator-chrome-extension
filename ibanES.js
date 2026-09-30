// Spanish IBAN (24 chars): ES + 2 check + CCC (4 entity + 4 branch + 2 ctrl digits + 10 account).
// Inner control digits use the Banco de Espana mod-11 algorithm with weights
// 1,2,4,8,5,10,9,7,3,6; shorter inputs are left-padded with zeros. Verified against
// the official example IBAN ES9121000418450200051332 (ctrl digits 4 and 5).

const IbanES = (function () {
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('./iban.js')
    : IBAN; // global from iban.js (browser)

  const weights = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];

  // str: up to 10 digits; left-padded with zeros
  function calculateControlDigit(str) {
    const padded = str.padStart(10, '0');
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(padded[i], 10) * weights[i];
    }
    const dc = 11 - (sum % 11);
    return dc === 11 ? 0 : dc === 10 ? 1 : dc;
  }

  // Real Spanish bank entity + branch codes (prefix 00 pad to 4 digits)
  const entityBranchCodes = [
    ['0049', '0001'], // Banco Santander
    ['0075', '0001'], // CaixaBank
    ['0182', '0001'], // BBVA
    ['1465', '0001'], // ING Bank
    ['0049', '2352'], // Banco Santander (secondary branch)
  ];

  function generateIbanES() {
    const [entity, branch] = entityBranchCodes[Math.floor(Math.random() * entityBranchCodes.length)];
    const account = Shared.randomDigits(10);
    const firstControl = calculateControlDigit(entity + branch);
    const secondControl = calculateControlDigit(account);
    const ccc = entity + branch + firstControl + secondControl + account;
    const checkDigits = Shared.calculateIbanCheckDigits('ES', ccc);
    return `ES${checkDigits}${ccc}`;
  }

  return {
    generateIbanES,
    calculateControlDigit
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IbanES;
}
