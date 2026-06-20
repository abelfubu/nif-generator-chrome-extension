# NIF Generator Chrome Extension

A Chrome extension that generates and copies valid identification numbers for Spain (NIF, NIE, CIF) and Italy (Codice Fiscale, Partita IVA).

## Language

**Identification Number**:
A government-issued code that identifies a person or organization for tax or administrative purposes.
_Avoid_: ID, document, fiscal code (unless context-specific).

**NIF** (Número de Identificación Fiscal):
Spanish tax identification number for Spanish nationals. Format: 8 digits + 1 control letter.
_Avoid_: DNI.

**NIE** (Número de Identidad de Extranjero):
Spanish identification number for foreign residents. Format: `X`, `Y`, or `Z` + 7 digits + 1 control letter.
_Avoid_: Foreigner ID.

**CIF** (Certificado de Identificación Fiscal):
Spanish company tax identification code. Format: 1 entity type letter + 7 digits + 1 control character (digit or letter).
_Avoid_: Company tax number.

**Codice Fiscale**:
Italian fiscal code for individuals. Format: 3 surname consonants + 3 name consonants + 2 year digits + 1 month letter + 2 day digits (with +40 for females) + 4 place-of-birth characters + 1 control letter.
_Avoid_: Italian fiscal code, CF.

**Partita IVA**:
Italian VAT number for organizations. Format: `IT` + 10 digits + 1 check digit.
_Avoid_: VAT, P.IVA (in user-facing text).

**Control Character**:
The final character of an identification number, computed from the preceding characters to detect transcription errors.
_Avoid_: Check digit (use only when the character is a digit).
