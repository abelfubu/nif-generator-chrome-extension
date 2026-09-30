const assert = require('assert');
const IBAN = require('../iban.js');
const IbanITA = require('../ibanITA.js');
const IbanES = require('../ibanES.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (err) {
    failed++;
    console.error(`❌ ${name}`);
    console.error(`   ${err.message}`);
  }
}

// Independent IBAN checksum verifier (ISO 7064 MOD-97-10)
function isValidIban(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let num = '';
  for (const char of rearranged) {
    num += /[0-9]/.test(char) ? char : (char.charCodeAt(0) - 55).toString();
  }
  let remainder = 0;
  for (const digit of num) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }
  return remainder === 1;
}

// Known valid IBANs from the official IBAN registry
const knownIbans = [
  'IT60X0542811101000000123456',
  'ES9121000418450200051332',
];

for (const iban of knownIbans) {
  test(`check digits for known valid IBAN ${iban}`, () => {
    const country = iban.slice(0, 2);
    const bban = iban.slice(4);
    assert.strictEqual(IBAN.calculateIbanCheckDigits(country, bban), iban.slice(2, 4));
  });
}

test('IT60X0542811101000000123456 is a valid IBAN', () => {
  assert.ok(isValidIban('IT60X0542811101000000123456'));
});

// Italian IBAN
const itIbans = new Set();
for (let i = 0; i < 1000; i++) itIbans.add(IbanITA.generateIbanITA());

test('generated IT IBANs match IT format (27 chars)', () => {
  for (const iban of itIbans) {
    assert.ok(/^IT\d{2}[A-Z]\d{5}\d{5}[A-Z0-9]{12}$/.test(iban), `bad format: ${iban}`);
  }
});

test('generated IT IBANs pass ISO 7064 checksum', () => {
  for (const iban of itIbans) {
    assert.ok(isValidIban(iban), `bad checksum: ${iban}`);
  }
});

test('generated IT IBANs use known ABI bank codes', () => {
  const knownAbi = ['01005', '02008', '03385', '05116', '01030'];
  for (const iban of itIbans) {
    assert.ok(knownAbi.includes(iban.slice(5, 10)), `unknown ABI: ${iban}`);
  }
});

test('ITA CIN is stable for a fixed payload', () => {
  // Derived from known valid IBAN IT60X0542811101000000123456:
  // CIN=X, ABI=05428, CAB=11101, account=000000123456
  assert.strictEqual(IbanITA.calculateCin('05428', '11101', '000000123456'), 'X');
});

// Spanish IBAN
const esIbans = new Set();
for (let i = 0; i < 1000; i++) esIbans.add(IbanES.generateIbanES());

test('generated ES IBANs match ES format (24 chars)', () => {
  for (const iban of esIbans) {
    assert.ok(/^ES\d{2}\d{4}\d{4}\d{2}\d{10}$/.test(iban), `bad format: ${iban}`);
  }
});

test('generated ES IBANs pass ISO 7064 checksum', () => {
  for (const iban of esIbans) {
    assert.ok(isValidIban(iban), `bad checksum: ${iban}`);
  }
});

test('ES control digit algorithm is self-consistent', () => {
  // Round-trip: every digit 0-9 contributes so recomputing over the full CCC keeps validity
  for (const es of esIbans) {
    const ccc = es.slice(4);
    const expected = `${IbanES.calculateControlDigit(ccc.slice(0, 8))}${IbanES.calculateControlDigit(ccc.slice(10))}`;
    assert.strictEqual(ccc.slice(8, 10), expected, `bad CCC ctrl digits: ${es}`);
  }
});

test('IT and ES IBANs never collide in format', () => {
  for (const iban of itIbans) assert.ok(iban.startsWith('IT'));
  for (const iban of esIbans) assert.ok(iban.startsWith('ES'));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
