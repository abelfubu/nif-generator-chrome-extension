# NIF/NIE/CIF and Italian Fiscal Code Generator Extension

A Chrome extension that generates valid identification numbers for Spain and Italy:

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
- Codice Fiscale follows the Italian fiscal code structure
- Partita IVA implements the correct Italian VAT number algorithm

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable Developer mode
4. Click "Load unpacked" and select the extension directory

## Technologies Used

- Manifest V3
- JavaScript
- HTML/CSS