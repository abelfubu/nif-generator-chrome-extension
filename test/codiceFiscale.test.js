const assert = require('assert');
const {
  encodeSurname,
  encodeName,
  generateCodiceFiscale,
  calculateCodiceFiscaleControlChar
} = require('../codiceFiscale.js');

const MONTH_CODES = 'ABCDEHLMPRST';
const PLACE_CODE_RE = /^[A-Z]\d{3}$/;

function isValidCodiceFiscale(cf) {
  if (typeof cf !== 'string' || cf.length !== 16) return false;
  const re = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  if (!re.test(cf)) return false;

  const month = cf[8];
  if (!MONTH_CODES.includes(month)) return false;

  const day = parseInt(cf.slice(9, 11), 10);
  if (day < 1 || day > 71) return false;
  const maleDay = day <= 31 ? day : day - 40;
  if (maleDay < 1 || maleDay > 31) return false;

  const placeCode = cf.slice(11, 15);
  if (!PLACE_CODE_RE.test(placeCode)) return false;

  return calculateCodiceFiscaleControlChar(cf.slice(0, 15)) === cf[15];
}

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

// Surname encoding
const surnameCases = [
  ['ROSSI', 'RSS'],
  ['BIANCHI', 'BNC'],
  ['BENVO', 'BNV'],
  ['AI', 'AIX'],
  ['SMITH', 'SMT'],
  ['AEIOU', 'AEI'],
  ['B', 'BXX'],
  ['BC', 'BCX'],
  ['BCD', 'BCD'],
  ['BCDE', 'BCD'],
  ['BCDEA', 'BCD'],
  ["D'AMICO", 'DMC'],
  ['DE LUCA', 'DLC'],
  ['MÜLLER', 'MLL'],
];

for (const [input, expected] of surnameCases) {
  test(`encodeSurname('${input}') -> ${expected}`, () => {
    assert.strictEqual(encodeSurname(input), expected);
  });
}

// Name encoding
const nameCases = [
  ['MARIO', 'MRA'],
  ['GIULIA', 'GLI'],
  ['ALEX', 'LXA'],
  ['EO', 'EOX'],
  ['JOHN', 'JHN'],
  ['MARCO', 'MRC'],
  ['ALESSANDRO', 'LSN'],
  ['BC', 'BCX'],
  ['BCD', 'BCD'],
  ['BCDE', 'BCD'],
  ['BCDEA', 'BCD'],
  ["D'AMICO", 'DMC'],
  ['DE LUCA', 'DLC'],
];

for (const [input, expected] of nameCases) {
  test(`encodeName('${input}') -> ${expected}`, () => {
    assert.strictEqual(encodeName(input), expected);
  });
}

// Control character - known valid codes
const knownCodes = [
  'RSSMRA85T10A562S',
  'BNCGLI99A41F205Q',
  'DPLMHL75P51H223N',
];

for (const cf of knownCodes) {
  test(`control char for ${cf}`, () => {
    assert.strictEqual(calculateCodiceFiscaleControlChar(cf.slice(0, 15)), cf[15]);
  });
}

// Generated codes are valid
const generatedCodes = new Set();
for (let i = 0; i < 1000; i++) {
  const cf = generateCodiceFiscale();
  generatedCodes.add(cf);
}

test('generated codice fiscale codes are valid', () => {
  for (const cf of generatedCodes) {
    assert.strictEqual(isValidCodiceFiscale(cf), true, `invalid: ${cf}`);
  }
});

test('generated codice fiscale codes are unique', () => {
  assert.ok(generatedCodes.size > 900, 'expected high uniqueness over 1000 samples');
});

// Format tests
const sample = generateCodiceFiscale();
test('generated codice fiscale is 16 characters', () => {
  assert.strictEqual(sample.length, 16);
});

test('generated codice fiscale matches format', () => {
  assert.ok(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(sample));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
