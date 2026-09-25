# You tab (profile)

Web source: `parkpass-web/src/components/Profile.tsx`.

A single scrolling column with 20pt side padding and 16pt gaps between cards.

## 1. Title

`you.title` ("Your expedition"), heading font, 27pt.

## 2. Progress card

`surface` background, 32pt radius, 20pt padding.

- The count in heading font 44pt `accent-700`, then `you.of31` ("/ 31 parks
  pinned") in 17pt bold `neutral-600`, aligned on the baseline.
- A progress bar: 14pt tall, fully rounded, `neutral-300` track, `accent`
  fill. The width is `round(count / 31 · 100)`%, and changes animate over
  0.5s with ease-out.
- Below: `you.toGo` (a plural of the remaining count, "19 parks to go — the
  diploma is waiting."), or `you.done` when all 31 are pinned. 13.5pt
  `neutral-700`.

## 3. Diploma card

`sage-200` background, 32pt radius.

- `you.diplomaTitle` in 15pt extra-bold `sage-900`.
- `you.diplomaBody` in 13.5pt `sage-800`.
- The link `you.diplomaLink`, 13.5pt bold `sage-700`, which opens
  `https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista`
  in the browser.

## 4. Transfer card ("Move your pins")

`surface` background, 32pt radius. The wire format is in
[transfer-codes.md](transfer-codes.md). This section covers only the UI.

- `you.transferTitle` (15pt extra-bold), then `you.transferBody` (13.5pt
  `neutral-700`).
- **With at least one pin:**
  - the label `you.yourCode`: 11.5pt bold, uppercase, tracking 0.06em,
    `neutral-600`
  - the code in a monospace box: `neutral-100` background, 12.5pt, selectable,
    wrapping at the dashes
  - a **Copy** button: outlined pill, 48pt. Tapping it copies the code, and the
    label shows `you.copied` for 2s. If the clipboard fails, show
    `you.copyFailed` as an error status.
  - Native: a **Share** button next to or below Copy opens the system share
    sheet with the code as plain text.
- **With no pins:** show `you.noCode` instead. An empty code transfers nothing.
- A 1px divider.
- **Import**:
  - the label `you.importLabel`, styled like `yourCode`
  - a 2-line monospace text field with the placeholder `you.importPlaceholder`,
    no autocorrect or spellcheck, auto-capitalising characters. Editing it
    clears the status line.
  - an **Import pins** button: solid `accent` pill, 48pt, labelled `you.import`
  - Native: offering a paste-from-clipboard action is recommended.
- **Import result** (status line, 13pt):
  - On a decode error, show the matching message in `accent-700`:
    `errorEmpty`, `errorCharset`, `errorLength`, `errorChecksum` or
    `errorVersion`.
  - On success, call `merge()` (see [storage.md](storage.md#merge-rules-used-by-transfer-code-import))
    and show in `sage-800`:
    - `importedPins` (plural of `added`) and/or `importedDates` (plural of
      `updated`), joined with a space
    - `importedNothing` when both are 0
  - Clear the text field after a successful import.

## 5. Language switch

A centred row, 12.5pt `neutral-600`: "`you.language`: **Svenska** · English".
The active language is bold `accent-700`; the other is underlined and
tappable. Switching changes the UI language right away and remembers the
choice. The default follows the device language (see [i18n.md](i18n.md)).

## 6. Honour footer

`you.honor`, 11.5pt `neutral-500`, centred.

On native apps, the app version may be shown below it in the same style.
