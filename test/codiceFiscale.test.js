const assert = require('assert');
const {
  encodeSurname,
  encodeName,
  generateCodiceFiscale,
  calculateCodiceFiscaleControlChar
} = require('../codiceFiscale.js');

const MONTH_CODES = 'ABCDEHLMPRST';
// Independently curated municipality fixtures, not imported from the generator.
const PLACE_CODES = new Set(['H501', 'F205', 'D612', 'L219', 'F839']);

function expectedControlChar(body) {
  const odd = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23];
  const sum = [...body].reduce((total, char, index) => {
    const value = /\d/.test(char) ? Number(char) : char.charCodeAt(0) - 65;
    return total + (index % 2 === 0 ? odd[value] : value);
  }, 0);
  return String.fromCharCode(65 + sum % 26);
}

// Test-only validator scoped to the generator's supported municipalities.
// Not a general validator for arbitrary or officially registered codes.
function isValidCodiceFiscale(cf) {
  if (typeof cf !== 'string' || cf.length !== 16) return false;
  const re = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  if (!re.test(cf)) return false;

  const month = cf[8];
  if (!MONTH_CODES.includes(month)) return false;

  const day = parseInt(cf.slice(9, 11), 10);
  if (day < 1 || day > 71) return false;
  const maleDay = day <= 31 ? day : day - 40;
  const year = Number(cf.slice(6, 8));
  const monthIndex = MONTH_CODES.indexOf(month);
  const daysInMonth = new Date(Date.UTC(2000 + year, monthIndex + 1, 0)).getUTCDate();
  if (maleDay < 1 || maleDay > daysInMonth) return false;

  const placeCode = cf.slice(11, 15);
  if (!PLACE_CODES.has(placeCode)) return false;

  return expectedControlChar(cf.slice(0, 15)) === cf[15];
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

test('reported code has a correct checksum but an unsupported birthplace', () => {
  const cf = 'TPTZLU98E44N001B';
  assert.strictEqual(expectedControlChar(cf.slice(0, 15)), cf[15]);
  assert.strictEqual(isValidCodiceFiscale(cf), false);
});

test('validator rejects impossible dates and incorrect checksums', () => {
  for (const body of ['RSSMRA99B31H501', 'RSSMRA99B71H501', 'RSSMRA99A00H501', 'RSSMRA99A40H501']) {
    assert.strictEqual(isValidCodiceFiscale(body + expectedControlChar(body)), false);
  }
  assert.strictEqual(isValidCodiceFiscale('RSSMRA85T10H501A'), false);
});

test('every birthplace selection generates a structurally valid code', () => {
  const originalRandom = Math.random;
  try {
    [...PLACE_CODES].forEach((place, index) => {
      // Constant randomness deterministically reaches each birthplace slot.
      Math.random = () => (index + 0.5) / PLACE_CODES.size;
      const cf = generateCodiceFiscale();
      assert.strictEqual(cf.slice(11, 15), place);
      assert.strictEqual(isValidCodiceFiscale(cf), true, `invalid: ${cf}`);
    });
    Math.random = () => 0;
    assert.strictEqual(isValidCodiceFiscale(generateCodiceFiscale()), true);
    Math.random = () => 1 - Number.EPSILON;
    assert.strictEqual(isValidCodiceFiscale(generateCodiceFiscale()), true);
  } finally {
    Math.random = originalRandom;
  }
});

// Generated codes are structurally valid, not registry-verified.
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
