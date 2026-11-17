# Whiteboard

Rewiring Aotearoa's whiteboard of fold-out cards.

- Select several things by dragging a box on empty board or Shift-clicking; drag any of them to move them together. Connectors between selected cards are selected too. Undo/Redo: toolbar arrows or Cmd/Ctrl + Z / Shift + Z.
- **Organise** tidies the board into neat columns and zooms to fit (your own layout is kept until you press it; undo puts it back). Expand all / Collapse all tidy and fit the same way.
- Opens on a chooser showing every board; each board has its own link (`…/whiteboard/#<board id>`).
- Click anywhere in a card's title, summary or detail and type: the cursor goes where you click and the text stays as it looks (bullets, fold-out sections, links). Enter on a bullet starts a new one; typing `- ` or `## ` at the start of a line still makes a bullet or section once you finish. The arrow folds and unfolds a card; the cards below move out of the way.
- Drag from the dot on a card's side to another card to connect them, or let go on empty board to make a new linked card. Connectors are curved and behave like a rope: where one would pass close to another card it is pushed aside and bends smoothly round it (cards that touch are treated as one block), and it glides rather than jumps when cards move.
- New cards start folded, showing just the title. Drag a card's bottom-right corner (or right edge) to make it wider or narrower; it keeps that width.
- Paste (or drop) pictures, links and text onto the board. Links appear as short pills; hover to switch one to a preview card (previews come from microlink.io, which is sent the link only when you choose *Show as card*).
- Emoji button: adds an emoji to the board, or into the text you're typing.
- **Text** (or T): a floating heading for a section of cards. Click it once to select, again to edit; Shift + Enter starts a new line; A− / A+ change the size. A heading moves down when a card above it unfolds, and moves with the card under it when you press Organise.
- **Timeline**: column bands for Weeks (Week 1, 2, 3…), Months or Years behind the cards, a little wider than a card. They carry on as far as you pan or zoom out. Choose *Across* (columns, time left to right) or *Down* (rows, time top to bottom), the first month or year, or *Line up with the cards*. It's saved with the board, so everyone sees it. While it's on, the Table gets a Week / Month / Year column showing where each card sits (a card spanning columns shows a range, e.g. *Jan – Feb 2027*); it's included in CSV exports.
- The **?** button bottom left opens a quick guide.
- Cmd/Ctrl + C, X and V copy, cut and paste cards and drawings (between boards too). Unfolded cards also have a Duplicate button.
- Set a priority from 1 (highest) to 10 and who is **Responsible** on an unfolded card (names already used are suggested). Both are columns in the Table too.
- Web addresses in a card's detail become clickable links. Cmd/Ctrl + Enter finishes editing. Colours: 12 presets, a custom colour, or *Auto* (follows priority); the toolbar can also switch the whole board to colour-by-priority.
- Draw with the marker (M). Each drawing becomes an object: click it to select, drag to move, drag the corner to resize. On an iPad, Apple Pencil draws straight onto the board; fingers pan, pinch to zoom, and never draw once a pencil has been used.
- The **Table** tab shows the same board as a spreadsheet: one row per card, editable both ways, with your own extra columns. Paste rows from Excel or Google Sheets to add cards (pasting never overwrites existing cards). Export to CSV.

## Two ways to use it

**Online:** https://rewiring-nz.github.io/whiteboard/ (team password). Boards are shared and saved to GitHub.

**Offline:** download `index.html` (or use *Download offline copy* in the ⋯ menu online), save it as `whiteboard.html`, and double-click it. No internet or password needed. Boards are saved in that browser on that computer, with:
- automatic snapshots in History every couple of minutes, plus named versions
- *Recently deleted* in the boards list, so deleted boards can be restored
- in Chrome or Edge, *Also save to a file on this computer…* keeps a `.json` file on disk up to date with every change

Move boards between the two with *Export all boards* and *Import from file*.

## Where online boards are saved

Board content is **not** in this repo. It lives in the private repo [`rewiring-nz/whiteboard-data`](https://github.com/rewiring-nz/whiteboard-data):

- `boards/<id>.json`: the current state of each board. Every save in the app is a commit, so the commit history is a full backup of every version, including deleted boards.
- `versions/<id>/…json`: named versions saved from the History panel.
- `assets/…`: pictures pasted onto boards.

Each browser also keeps a last-resort copy of the boards it has opened, and changes that never reached GitHub are merged in and saved on the next visit.

### Several people on one board

The top right shows the first names of everyone on the board. Each open board checks in about once a minute on a separate `presence` branch of the data repo (so board history stays clean) and reads the list every 15 seconds; people drop off about 2.5 minutes after leaving. Click your own name to change it.


Open boards check for other people's changes every 1.5 seconds and save your own about a second after you stop typing. Checks that find nothing new are free against GitHub's hourly allowance for the access key; if that allowance runs low, the board checks and saves less often instead of failing. When edits cross, they're merged card by card and field by field against the last version each person had, so both people's work is kept. Only when two people change the same field of the same card at the same time does the newest edit win; the other stays in the history. A deleted item stays deleted unless someone edited it meanwhile, in which case it's kept. Undo history resets when other people's changes arrive, so an undo can't wipe out their work.

Because the code and the data are in separate repos, changing or redeploying the app never touches board content.

## How the password works

GitHub Pages can't run a server, so the app talks to the GitHub API directly with a fine-grained access key that can only read and write the data repo. That key is stored in `config.enc.json`, encrypted with the team password (PBKDF2-SHA256, 600,000 rounds, AES-256-GCM). The page's code is public; the boards and the key are not readable without the password.

### Set or change the password, or renew the key

1. Create a fine-grained access key at https://github.com/settings/personal-access-tokens/new
   - Resource owner: **rewiring-nz**
   - Repository access: **Only select repositories** → `whiteboard-data`
   - Permissions → Repository → **Contents: Read and write**
   - Expiration: as long as the organisation allows (note the date: the board stops saving when it expires)
2. Run `node tools/set-password.mjs` in this repo and paste the key and choose the password when asked.
3. Commit and push `config.enc.json`.

People tick *Keep me signed in* (on by default) and only enter the password once per device. Changing the password alone doesn't sign anyone out; to sign everyone out, also create a new access key and delete the old one.

### Embedding on rewiring.nz (Webflow)

Add an Embed element with:

```html
<iframe src="https://rewiring-nz.github.io/whiteboard/" style="width:100%;height:85vh;border:0" title="Whiteboard"></iframe>
```

Webflow's page password only hides the Webflow page; the board's own password is what protects the data, so keep both.

## Rules for changing the app

- Never remove or rename a field or colour name that saved boards use (cards: kind, title, summary, body, color, open, priority, owner, fields, asset, url, disp, meta, emoji; boards: cards, edges, columns, strokes, timeline; strokes: g). The timeline is { unit, x, start }, plus dir "v" and y when it runs down the board. Text headings are cards with kind "text": the words are in title and the font size in w. New fields need a default so older boards still load.
- Keep the internal storage names (`foldout-board` IndexedDB, `fb-…` keys, `app: "foldout-board"` in exports). They date from the tool's first name, and offline boards live under them.
- Back up the data repo (it's git, so just note the current commit) before deploying a change that touches how boards are saved.
