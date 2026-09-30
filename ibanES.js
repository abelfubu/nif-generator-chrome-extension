// Spanish IBAN (24 chars): ES + 2 check + CCC (4 entity + 4 branch + 2 ctrl digits + 10 account).
// The 2 inner control digits use the Spanish CCC mod-10 algorithm (weights 1,2 alternating).

const IbanES = (function () {
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('./iban.js')
    : IBAN; // global from iban.js (browser)
  // Spanish control digit: alternating weights 1,2 from the left (first digit x1);
  // products > 9 get -9; control = 10 - (sum mod 10), with 10 -> 0.
  function calculateControlDigit(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      const product = parseInt(str[i], 10) * (i % 2 === 0 ? 1 : 2);
      sum += product > 9 ? product - 9 : product;
    }
    return (10 - (sum % 10)) % 10;
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
