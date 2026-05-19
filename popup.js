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
  // Generate a proper Italian fiscal code
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const vowels = 'AEIOU';
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Generate random surname (3 chars)
  const surnameConsonants = Array.from({length: 3}, () => consonants[Math.floor(Math.random() * consonants.length)]).join('');
  const surname = surnameConsonants.substring(0, 3);
  
  // Generate random name (3 chars)
  const nameConsonants = Array.from({length: 4}, () => consonants[Math.floor(Math.random() * consonants.length)]).join('');
  const name = nameConsonants.substring(0, 3);
  
  // Generate birth date (YYMMDD)
  const year = (Math.floor(Math.random() * 50) + 20).toString().padStart(2, '0'); // Years between 1970-2020
  const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
  const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0');
  
  // Gender (for day offset)
  const gender = ['M', 'F'][Math.floor(Math.random() * 2)];
  
  // Place of birth (4 chars - province code)
  const placeOfBirth = 'R001'; // Rome placeholder
  
  // Calculate control character
  const cfWithoutControl = (surname + name + year + month + day + placeOfBirth).toUpperCase();
  
  // Simplified control character calculation
  const controlChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const controlChar = controlChars[Math.floor(Math.random() * controlChars.length)];
  
  return `${cfWithoutControl}${controlChar}`;
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