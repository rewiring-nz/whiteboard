# Whiteboard

Rewiring Aotearoa's whiteboard of fold-out cards.

- Click a card to unfold its detail; the cards below move out of the way.
- Drag from the dot on a card's side to another card to connect them.
- Set a priority from 1 (highest) to 10 on an unfolded card, and switch between your own colours and colour-by-priority.
- Draw with the marker (M). On an iPad, Apple Pencil draws straight onto the board; fingers pan, pinch to zoom, and never draw once a pencil has been used.
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

Each browser also keeps a last-resort copy of the boards it has opened, and changes that never reached GitHub are saved on the next visit.

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

### Embedding on rewiring.nz (Webflow)

Add an Embed element with:

```html
<iframe src="https://rewiring-nz.github.io/whiteboard/" style="width:100%;height:85vh;border:0" title="Whiteboard"></iframe>
```

Webflow's page password only hides the Webflow page; the board's own password is what protects the data, so keep both.

## Rules for changing the app

- Never remove or rename a field or colour name that saved boards use (cards: title, summary, body, color, open, priority, fields; boards: cards, edges, columns, strokes). New fields need a default so older boards still load.
- Keep the internal storage names (`foldout-board` IndexedDB, `fb-…` keys, `app: "foldout-board"` in exports). They date from the tool's first name, and offline boards live under them.
- Back up the data repo (it's git, so just note the current commit) before deploying a change that touches how boards are saved.
