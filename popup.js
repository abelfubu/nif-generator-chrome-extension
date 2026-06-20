document.addEventListener('DOMContentLoaded', function () {
  const options = document.querySelectorAll('.option');
  
  options.forEach(option => {
    option.addEventListener('click', function () {
      const type = this.dataset.type;
      let result = '';
      
      switch (type) {
        case 'NIF':
          result = generateNIF();
          break;
        case 'NIE':
          result = generateNIE();
          break;
        case 'CIF':
          result = generateCIF();
          break;
        case 'codiceFiscale':
          result = generateCodiceFiscale();
          break;
        case 'partitaIVA':
          result = generatePartitaIVA();
          break;
      }
      
      navigator.clipboard.writeText(result).then(() => {
        console.log(`${type} copied to clipboard: ${result}`);
        
        // Send message to content script to handle pasting into inputs
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'pasteValue', value: result}, function(response) {
            if (chrome.runtime.lastError) {
              // Fallback if content script is not available
              if (window.opener && window.opener.document && ['INPUT', 'TEXTAREA'].includes(window.opener.document.activeElement?.tagName)) {
                window.opener.document.activeElement.value = result;
                window.opener.document.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                window.opener.document.activeElement.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                document.activeElement.value = result;
                document.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                document.activeElement.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        });
        
        // Create notification in the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'showNotification', 
            type: type, 
            result: result
          });
        });
        
        // Close the popup after selection
        window.close();
      }).catch(err => {
        console.error(`Failed to copy ${type} to clipboard:`, err);
      });
    });
  });
});

function generateNIF() {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const letter = letters[number % 23];
  return `${number}${letter}`;
}

function generateNIE() {
  const nieLetters = 'XYZ';
  const nieLetter = nieLetters[Math.floor(Math.random() * nieLetters.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const controlDigit = parseInt(nieLetter.replace('X', '0').replace('Y', '1').replace('Z', '2') + number) % 23;
  const controlLetter = letters[controlDigit];
  return `${nieLetter}${number}${controlLetter}`;
}

function generateCIF() {
  const legalEntityTypes = 'ABCDEFGHJKLMNPQRSUVW'; // Valid CIF entity types
  const entityType = legalEntityTypes[Math.floor(Math.random() * legalEntityTypes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  
  // Calculate checksum according to CIF algorithm
  let oddSum = 0;
  let evenSum = 0;
  
  // Sum of odd positions
  for (let i = 0; i < number.length; i += 2) {
    const digit = parseInt(number[i]);
    const doubled = (digit * 2).toString();
    const sum = doubled.split('').reduce((acc, d) => acc + parseInt(d), 0);
    oddSum += sum;
  }
  
  // Sum of even positions
  for (let i = 1; i < number.length; i += 2) {
    evenSum += parseInt(number[i]);
  }
  
  const total = oddSum + evenSum;
  const controlDigit = (10 - (total % 10)) % 10;
  
  // For CIF, the last digit can be a number or a letter depending on the entity type
  if (entityType.match(/[ABEH]/)) { // Companies that start with these letters often have numeric control
    return `${entityType}${number}${controlDigit}`;
  } else {
    const letters = 'JABCDEFGHI';
    const controlLetter = letters[controlDigit];
    return `${entityType}${number}${controlLetter}`;
  }
}

function generateCodiceFiscale() {
  // Generates a strictly valid Italian Codice Fiscale.
  // Format: CCC CCC YY M DD LLL C
  // - 3 surname consonants
  // - 3 name consonants (real encoding rules)
  // - 2 year digits
  // - 1 month letter
  // - 2 day digits (+40 for females)
  // - 4 place-of-birth characters
  // - 1 control letter

  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const monthCodes = 'ABCDEHLMPRST';
  const placesOfBirth = ['R001', 'M001', 'N001', 'T001', 'F001']; // Rome, Milan, Naples, Turin, Florence

  function isVowel(char) {
    return vowels.includes(char.toUpperCase());
  }

  function isConsonant(char) {
    return consonants.includes(char.toUpperCase());
  }

  function encodeNamePart(input) {
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
    // Build a random consonant/vowel pattern so encoding rules produce 3 chars naturally.
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

  const surname = encodeNamePart(generateRandomNamePart());
  const name = encodeNamePart(generateRandomNamePart());

  const year = (Math.floor(Math.random() * 50) + 20).toString().padStart(2, '0'); // 1970-2019
  const month = monthCodes[Math.floor(Math.random() * monthCodes.length)];
  const dayBase = Math.floor(Math.random() * 28) + 1;
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
    if (i % 2 === 0) {
      sum += oddValues[char];
    } else {
      sum += evenValues[char];
    }
  }

  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[sum % 26];
}

function generatePartitaIVA() {
  // Generate a proper Italian VAT number (Partita IVA)
  const number = Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
  
  // Calculate check digit using Luhn algorithm variant
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(number[i]) * weights[i];
    if (digit > 9) {
      digit = Math.floor(digit / 10) + (digit % 10);
    }
    sum += digit;
  }
  
  const controlDigit = (10 - (sum % 10)) % 10;
  
  return `IT${number}${controlDigit}`;
}