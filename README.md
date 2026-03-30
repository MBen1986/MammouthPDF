# MammouthAI PDF Export (Chrome/Chromium/Vivaldi)

## English

Browser extension for `https://mammouth.ai/app/*` that converts MammouthAI chats into a print-friendly layout for PDF export.

### Goal

Produce clean PDF exports with:
- complete user inputs and assistant outputs,
- tables, code blocks, and images,
- stable page flow,
- selectable page density.

### Features

- Detects user (`Input`) and assistant (`Answer`) messages in order
- A4 print layout with clean structure
- Export dialog options:
  - `Include thinking/reasoning blocks` (default: OFF)
  - `Page density`: `Normal` / `Compact` / `Ultra Compact` (default: `Normal`)
- Dynamic suggested filename: `MammouthAI-<ChatName>` (sanitized)
- Removes UI controls from export output
- Remembers selected options locally

### Requirements

- Chrome, Chromium, or Vivaldi
- Access to `https://mammouth.ai/*`
- Popups allowed for `mammouth.ai`

### Installation (Developer Mode)

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this project root folder (`MammouthPDF`)

### Usage

1. Fully load the MammouthAI chat (including images/tables)
2. Click `PDF Export` (floating button)
3. Select options in the export dialog
4. In the print dialog:
   - Destination: `Save as PDF`
   - Paper size: `A4`
   - Enable `Background graphics`
   - Optional: disable browser headers/footers

### Options

#### Thinking/Reasoning

- `OFF` (recommended): final answer content only
- `ON`: includes available thinking/reasoning blocks

#### Page Density

- `Normal`: best readability
- `Compact`: less whitespace, more content per page
- `Ultra Compact`: maximum compression

### Troubleshooting

#### New tab opens but nothing happens

- Reload extension in `chrome://extensions`
- Reload the chat page
- Check popup permissions for `mammouth.ai`

#### Too many pages

- Switch page density to `Compact` or `Ultra Compact`
- Disable print headers/footers

#### `about:blank` in footer

- Comes from browser print headers/footers
- Disable `Headers and footers` in print settings

#### CSP warning about inline script

- Removed in final version (no inline auto-print script)
- If warning persists: reload extension + page

### Limits

- Export is based on currently loaded DOM content
- Unreachable external images may appear as placeholders
- Very large chats may take longer to prepare

### File Structure

- `manifest.json` – MV3 configuration
- `content.js` – UI + export logic + print styling
- `README.md` – documentation

### Status

Final accepted feature set.

---

## Deutsch

Browser-Erweiterung für `https://mammouth.ai/app/*`, die MammouthAI-Chats in ein druckfreundliches Layout überführt und den PDF-Export vorbereitet.

### Ziel

Sauber formatierte PDF-Exporte mit:
- vollständigen Eingaben + Antworten,
- Tabellen, Codeblöcken und Bildern,
- stabiler Seitentrennung,
- einstellbarer Seitendichte.

### Funktionsumfang

- Erkennung von User-Nachrichten (`Eingabe`) und Assistant-Nachrichten (`Antwort`) in Reihenfolge
- Drucklayout mit klaren Blöcken und A4-Ausgabe
- Export-Dialog mit Optionen:
  - `Thinking-/Reasoning-Blöcke einbeziehen` (Default: AUS)
  - `Seitendichte`: `Normal` / `Compact` / `Ultra Compact` (Default: `Normal`)
- Dynamischer Dateiname im Druckvorschlag: `MammouthAI-<Chatname>` (bereinigt von Sonderzeichen/Markdown)
- Entfernt UI-Elemente aus der Ausgabe (z. B. Copy-Buttons/Bedienelemente)
- Merkt sich die zuletzt verwendeten Optionen lokal

### Voraussetzungen

- Chrome, Chromium oder Vivaldi
- Zugriff auf `https://mammouth.ai/*`
- Popups für `mammouth.ai` erlaubt (für den Export-Tab)

### Installation (Entwicklermodus)

1. `chrome://extensions` öffnen
2. `Entwicklermodus` aktivieren
3. `Entpackte Erweiterung laden` klicken
4. Dieses Projekt-Root auswählen (`MammouthPDF`)

### Nutzung

1. MammouthAI-Chat vollständig laden (inkl. Bildern/Tabellen)
2. Auf `PDF Export` (unten rechts) klicken
3. Optionen im Export-Dialog wählen
4. Im Druckdialog:
   - Ziel: `Als PDF speichern`
   - Papierformat: `A4`
   - `Hintergrundgrafiken` aktivieren
   - Optional: Browser-Header/Footer deaktivieren

### Optionen im Detail

#### Thinking-/Reasoning-Blöcke

- `AUS` (empfohlen für normale Reports): nur sichtbare finale Antwortinhalte
- `EIN`: zusätzliche Thinking-/Reasoning-Bereiche, sofern im DOM verfügbar

#### Seitendichte

- `Normal`: beste Lesbarkeit
- `Compact`: weniger Leerraum, mehr Inhalt pro Seite
- `Ultra Compact`: maximale Verdichtung

### Troubleshooting

#### Neuer Tab öffnet sich, aber nichts passiert

- Erweiterung neu laden (`chrome://extensions`)
- Seite neu laden
- Popup-Blocker für `mammouth.ai` prüfen

#### Zu viele Seiten

- Seitendichte auf `Compact` oder `Ultra Compact` setzen
- Druck-Header/Footer deaktivieren

#### `about:blank` im Footer

- Kommt vom Browser-Print-Header/Footer
- Im Druckdialog `Kopf- und Fußzeilen` deaktivieren

#### CSP-Warnung zu Inline-Script

- In der finalen Version entfernt (kein Inline-Auto-Print-Script mehr)
- Falls alte Warnung noch erscheint: Erweiterung neu laden + Seite neu laden

### Grenzen

- Export basiert auf aktuell im Browser-DOM geladenen Chat-Inhalten
- Nicht mehr erreichbare externe Bilder können als Platzhalter erscheinen
- Sehr große Chats können etwas länger im Druckaufbau dauern

### Dateistruktur

- `manifest.json` – MV3-Konfiguration
- `content.js` – UI/Export-Logik inkl. Drucklayout
- `README.md` – Dokumentation

### Status

Projektstand: Finaler Funktionsstand gemäß Abnahme.
