# Foldout Board

A password-protected whiteboard of fold-out cards for Rewiring Aotearoa.

- Click a card to unfold its detail; the cards below move out of the way.
- Drag from the dot on a card's side to another card to connect them.
- Set a priority from 1 (highest) to 10 on an unfolded card, and switch between your own colours and colour-by-priority.
- Draw on the board with the marker (M).
- The **Table** tab shows the same board as a spreadsheet: one row per card, editable both ways, with your own extra columns. Paste rows from Excel or Google Sheets to add cards (pasting never overwrites existing cards). Export to CSV.

Live at **https://rewiring-nz.github.io/foldout-board/**

## Where the boards are saved

Board content is **not** in this repo. It lives in the private repo [`rewiring-nz/foldout-board-data`](https://github.com/rewiring-nz/foldout-board-data):

- `boards/<id>.json`: the current state of each board. Every save in the app is a commit, so the commit history is a full backup of every version, including deleted boards.
- `versions/<id>/…json`: named versions saved from the History panel.

Each browser also keeps a last-resort copy of the boards it has opened, and changes that never reached GitHub are saved on the next visit.

Because the code and the data are in separate repos, changing or redeploying the app never touches board content.

## How the password works

GitHub Pages can't run a server, so the app talks to the GitHub API directly with a fine-grained access key that can only read and write the data repo. That key is stored in `config.enc.json`, encrypted with the team password (PBKDF2-SHA256, 600,000 rounds, AES-256-GCM). The page's code is public; the boards and the key are not readable without the password.

### Set or change the password, or renew the key

1. Create a fine-grained access key at https://github.com/settings/personal-access-tokens/new
   - Resource owner: **rewiring-nz**
   - Repository access: **Only select repositories** → `foldout-board-data`
   - Permissions → Repository → **Contents: Read and write**
   - Expiration: as long as the organisation allows (note the date: the board stops saving when it expires)
2. Run `node tools/set-password.mjs` in this repo and paste the key and choose the password when asked.
3. Commit and push `config.enc.json`.

Anyone who already had the board open is asked for the new password next time.

## Rules for changing the app

- Never remove or rename a field or colour name that saved boards use (cards: title, summary, body, color, open, priority, fields; boards: cards, edges, columns, strokes). New fields need a default so older boards still load.
- Back up the data repo (it's git, so just note the current commit) before deploying a change that touches how boards are saved.
