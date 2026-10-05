# NIF/NIE/CIF and Italian Fiscal Code Generator Extension

A Chrome extension that generates synthetic identification numbers for testing in Spain and Italy:

## Features

- **Spain**:
  - NIF (Número de Identificación Fiscal) for individuals
  - NIE (Número de Identidad de Extranjero) for foreigners
  - CIF (Certificado de Identificación Fiscal) for companies

- **Italy**:
  - Codice Fiscale (Italian fiscal code)
  - Partita IVA (Italian VAT number)

## How to Use

1. Click on the extension icon in the Chrome toolbar
2. Select the type of document you want to generate
3. The generated code will be copied to your clipboard automatically
4. It will also be pasted into any selected input field on the webpage
5. An onchange event is triggered to ensure the webpage recognizes the value

## Validity

All generated codes follow the official algorithms and include proper checksums:
- NIF uses the standard 8-digit number + control letter algorithm
- NIE follows the correct format with proper control character
- CIF implements the official algorithm for Spanish company codes
- Codice Fiscale follows the Italian fiscal code structure, with a valid date, a curated active municipality code, and a control letter
- Partita IVA implements the correct Italian VAT number algorithm

### Codice Fiscale: format vs. official registration

Generated Codice Fiscale values are **synthetic test data**, not government-issued identities. They use birthplace codes for Roma (`H501`), Milano (`F205`), Firenze (`D612`), Torino (`L219`), and Napoli (`F839`).

The [Agenzia delle Entrate verification service](https://telemanagrafici.agenziaentrate.gov.it/VerificaCF/) checks whether a code exists in **Anagrafe tributaria**. A correct structure and checksum do not establish registration. Randomly generated values cannot be guaranteed to pass that service or other registry-backed checks (such as invoicing checks).

For registry-backed testing, use an authorized registered identity or fixtures supplied by the target test environment. Do not use generated values as real identities; accidental matches with registered codes are possible.

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable Developer mode
4. Click "Load unpacked" and select the extension directory

## Technologies Used

- Manifest V3
- JavaScript
- HTML/CSS