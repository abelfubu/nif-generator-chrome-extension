const CodiceFiscale = (function () {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const monthCodes = 'ABCDEHLMPRST';
  const placesOfBirth = ['R001', 'M001', 'N001', 'T001', 'F001'];

  function isVowel(char) {
    return vowels.includes(char.toUpperCase());
  }

  function isConsonant(char) {
    return consonants.includes(char.toUpperCase());
  }

  function encodeSurname(input) {
    const chars = input.toUpperCase().split('');
    const con = chars.filter(isConsonant);
    const vow = chars.filter(isVowel);

    if (con.length >= 3) {
      return con.slice(0, 3).join('');
    }
    if (con.length === 2) {
      return con.join('') + (vow[0] || 'X');
    }
    if (con.length === 1) {
      return con[0] + (vow.slice(0, 2).join('') || 'XX').padEnd(2, 'X');
    }
    return (vow.slice(0, 3).join('') || 'XXX').padEnd(3, 'X');
  }

  function encodeName(input) {
    const chars = input.toUpperCase().split('');
    const con = chars.filter(isConsonant);
    const vow = chars.filter(isVowel);

    if (con.length >= 4) {
      return con[0] + con[2] + con[3];
    }
    if (con.length === 3) {
      return con.join('');
    }
    if (con.length === 2) {
      return con.join('') + (vow[0] || 'X');
    }
    if (con.length === 1) {
      return con[0] + (vow.slice(0, 2).join('') || 'XX').padEnd(2, 'X');
    }
    return (vow.slice(0, 3).join('') || 'XXX').padEnd(3, 'X');
  }

  function generateRandomNamePart() {
    const patternLength = Math.floor(Math.random() * 3) + 4; // 4 to 6 chars
    let result = '';
    for (let i = 0; i < patternLength; i++) {
      if (Math.random() < 0.6) {
        result += consonants[Math.floor(Math.random() * consonants.length)];
      } else {
        result += vowels[Math.floor(Math.random() * vowels.length)];
      }
    }
    return result;
  }

  function generateCodiceFiscale() {
    const surname = encodeSurname(generateRandomNamePart());
    const name = encodeName(generateRandomNamePart());

    const fullYear = Math.floor(Math.random() * 50) + 1970; // 1970-2019
    const year = (fullYear % 100).toString().padStart(2, '0');
    const month = monthCodes[Math.floor(Math.random() * monthCodes.length)];
    const dayBase = Math.floor(Math.random() * 28) + 1; // 1-28 avoids invalid month lengths
    const gender = ['M', 'F'][Math.floor(Math.random() * 2)];
    const day = (gender === 'F' ? dayBase + 40 : dayBase).toString().padStart(2, '0');
    const placeOfBirth = placesOfBirth[Math.floor(Math.random() * placesOfBirth.length)];

    const cfWithoutControl = (surname + name + year + month + day + placeOfBirth).toUpperCase();
    const controlChar = calculateCodiceFiscaleControlChar(cfWithoutControl);

    return `${cfWithoutControl}${controlChar}`;
  }

  function calculateCodiceFiscaleControlChar(cfWithoutControl) {
    const oddValues = {
      '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
      'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
      'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
      'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
    };

    const evenValues = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
      'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
      'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
    };

    let sum = 0;
    for (let i = 0; i < cfWithoutControl.length; i++) {
      const char = cfWithoutControl[i];
      sum += (i % 2 === 0) ? oddValues[char] : evenValues[char];
    }

    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[sum % 26];
  }

  return {
    encodeSurname,
    encodeName,
    generateCodiceFiscale,
    calculateCodiceFiscaleControlChar
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodiceFiscale;
}
