# Who Gifts Who (WGW)

**Who Gifts Who** is a free Secret Santa (*Amigo Invisible*) web app that runs entirely in your browser. It is 100% static (HTML, CSS and vanilla JavaScript modules), with no backend, no database, no build step and no paid services. Upload it to a GitHub repository, turn on GitHub Pages, and it works.

The interface is available in **Spanish and English**, works on phones and desktops, and saves your draft (participants and rules) in the browser's `localStorage`.

## Features

- **Participants**: add, edit and remove people by hand. Names are required and must be unique (case-insensitive). Each person can optionally belong to a **family group** (free text with suggestions).
- **Import** from `.txt`, `.csv` or `.json` files, or paste a list. A preview shows exactly what will be imported and flags empty lines, duplicates and names that already exist.
- **Export** the whole configuration (participants, groups and rules) to a JSON file so you can reuse it next year.
- **Rules**:
  - Nobody can gift themselves (always on).
  - *Exclude family members*: nobody gifts someone from their own family group.
  - Individual exclusions ("X cannot gift Y"), one way or both ways.
  - Active rules are listed clearly, and each one can be removed.
- **Feasibility check**: before the draw, the app checks that at least one valid assignment exists. If none does, it explains why in plain language (e.g. *"Familia García has 5 of 8 people; with family exclusion they can only gift the other 3 people, so no combination is possible"*), and the draw button stays disabled.
- **Exact probabilities** (hidden by default): a "who gifts whom" heat map, ranked lists of "you gift…" and "you are gifted by…" for each person, and the total number of valid combinations. They update in real time as participants or rules change.
- **Uniform, secure draw**: every valid assignment is equally likely, so results match the probabilities shown. Randomness comes from `crypto.getRandomValues`. The results are **not shown** to the organizer.
- **Delivery without a server**:
  - **Secret links**: one link per person, with the result encrypted (AES-GCM, Web Crypto API) inside the URL fragment (`#…`), which browsers never send to any server. Each person has a **WhatsApp** button, a **Share** button (Web Share API, where available) and a **Copy link** button.
  - **In person**: the phone is passed from person to person. The app shows whose turn it is, that person taps to see their result, and then hides it before passing the phone on.
  - **Reveal all**: an organizer option, behind an explicit confirmation, for when someone loses their link.

## Publishing on GitHub Pages (step by step)

1. Create a new repository on GitHub named **`who-gifts-who`** (public, or private if your plan supports Pages for private repositories).
2. Upload the files in this folder to the root of the repository. You can drag and drop them in the GitHub web UI (**Add file → Upload files**) or use git:
   ```bash
   git remote add origin https://github.com/<your-user>/who-gifts-who.git
   git push -u origin main
   ```
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, then pick the **`main`** branch and the **`/ (root)`** folder. Click **Save**.
5. Wait a minute or two. Your app will be live at `https://<your-user>.github.io/who-gifts-who/`.

All paths are relative, so the app works under `/who-gifts-who/` (or any other sub-path or custom domain). The empty `.nojekyll` file tells GitHub Pages to serve the files as they are.

### Running locally

ES modules need to be served over HTTP (opening `index.html` directly with `file://` will not work):

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

## Import file formats

Sample files are in [`examples/`](examples/).

### Plain text (`.txt`) or CSV (`.csv`)

One participant per line. To set a family group, add it after a **semicolon**:

```text
# Lines starting with # are comments
Ana;Familia García
Luis;Familia García
Pedro;Familia López
Marta
Javier
```

- Supported separators: `;` (recommended), tab, or `,`.
- Values can be wrapped in double quotes if they contain a separator: `"García, Ana";Familia García`.
- An optional header line (`name;group`, `nombre;grupo`) is skipped.
- Empty lines, duplicate names and names already on the list are shown in the preview and skipped.
- Names and groups are limited to 60 characters. Name and group matching is case-insensitive.

### JSON (`.json`)

Any of these shapes are accepted:

```json
["Ana", "Luis", "Marta"]
```

```json
[{ "name": "Ana", "group": "Familia García" }, { "name": "Marta" }]
```

or a full configuration, which is the format produced by **Export configuration**:

```json
{
  "app": "who-gifts-who",
  "version": 1,
  "exportedAt": "2026-11-03T10:00:00.000Z",
  "participants": [
    { "name": "Ana", "group": "Familia García" },
    { "name": "Luis", "group": "Familia García" },
    { "name": "Marta" },
    { "name": "Javier" }
  ],
  "settings": { "excludeFamily": true },
  "exclusions": [
    { "from": "Marta", "to": "Javier", "mutual": true },
    { "from": "Javier", "to": "Ana", "mutual": false }
  ]
}
```

| Field | Type | Description |
| --- | --- | --- |
| `app` | string | Always `"who-gifts-who"`. Informational. |
| `version` | number | Format version (currently `1`). |
| `exportedAt` | string | ISO date of the export. Informational. |
| `participants` | array | Required. Each item is `{ "name": string, "group"?: string }`. |
| `settings.excludeFamily` | boolean | Whether people cannot gift members of their own family group. |
| `exclusions` | array | Each item is `{ "from": name, "to": name, "mutual": boolean }`. `mutual: true` blocks both directions. |

Participants are referenced **by name**, so the file is easy to read and edit by hand. When importing, `settings` are only applied in **Replace the current list** mode. Exclusions that mention unknown names are ignored.

## How the maths works

All valid assignments (perfect matchings of the bipartite graph *givers → allowed receivers*) are treated as equally likely.

- **Up to 20 participants: exact.** Dynamic programming over bitmasks counts the valid assignments. `f[mask]` is the number of ways to assign the first *k* givers to the receivers in `mask`, and `g[mask]` is the number of ways to complete the assignment. The number of assignments containing *i → j* is `Σ f[mask] · g[mask ∪ {j}]`, so the probability is that count divided by the total.
- **More than 20: estimated.** The app uses sequential importance sampling (Rasmussen's estimator): givers pick uniformly among the receivers still free, and the product of the number of choices weights each sample. The UI labels these numbers as an estimate.
- **The draw** samples uniformly:
  - **Up to 20 participants**, it picks receivers one by one, weighted by the DP completion counts (exactly uniform).
  - **Above 20**, it uses rejection sampling over uniform random permutations (exactly uniform). If the rules are so tight that rejection keeps failing, it falls back to a Markov chain with swap/3-cycle moves, started from a valid matching (approximately uniform).
  - It never uses the "if you draw yourself, draw again" method, which can dead-end and biases results.
- **Feasibility** is checked with maximum bipartite matching (Kuhn's algorithm). When no assignment exists, Hall's theorem is used to name the group of people who do not have enough possible receivers.

## Project structure

```text
index.html            Organizer app
reveal.html           Page that opens a secret link
favicon.svg           WGW icon
css/styles.css        Styles (mobile-first, light/dark)
js/app.js             Entry point: wires state, derived data and views
js/reveal.js          Reveal page logic
js/state.js           Observable store + actions (persisted to localStorage)
js/storage.js         Safe localStorage helpers
js/core/              Pure logic, no DOM (unit-tested in Node)
  participants.js     Participant model and validation
  rules.js            Exclusions and the "allowed" matrix
  feasibility.js      Matching, feasibility and plain-language reasons
  matching.js         Counting and probabilities (exact DP / sampling)
  draw.js             Uniform draw
  crypto.js           AES-GCM secret link tokens
  importer.js         .txt/.csv/.json parsing and preview
  config.js           Export / import of the full configuration
  random.js           crypto.getRandomValues helpers
js/i18n/              Translations (es.js, en.js) and helpers
js/ui/                One module per section/dialog, each with render(state, derived)
examples/             Sample import files
tests/                Node tests for the logic
```

**Extending the app:** add a view in `js/ui/` that exports a `render(state, derived)` function and register it in `js/app.js`. Add new actions in `js/state.js`, and add text keys to both `js/i18n/es.js` and `js/i18n/en.js`. To add a language, create a new dictionary and register it in `js/i18n/index.js`. Secret link payloads are versioned (`v`), so they can carry more fields later (an event name, a budget…).

## Tests

The tests need Node.js 20+ and have no dependencies:

```bash
npm test
```

They check that:

- nobody gifts themselves;
- family groups and exclusions are respected, including in large groups;
- impossible configurations are detected and explained;
- exact counts match known values (derangements) and brute force;
- **draw frequencies match the computed probabilities** over many draws, and every valid assignment is equally likely (chi-square test);
- import/export round trips work, and the example files import cleanly;
- secret links decrypt correctly and do not reveal names.

## Limitations and privacy notes

- **The secret link *is* the key.** The result is encrypted, but the decryption key travels inside the link itself, so that anyone can open their own link without a server. Nobody can read a result just by looking at the URL, but anyone who has the link can open it. In particular, the organizer generates and sends the links, so **they could technically open other people's links**. The organizer is trusted not to peek.
- The draw (including all links) is stored in the organizer's browser (`localStorage`) so the links can be sent again later. Anyone with access to that browser could inspect it. Use **Delete draw** when you are done.
- If you **run the draw again**, links that were already sent keep showing the old result, because each link is self-contained. Resend all links.
- In-person mode relies on people not looking at the screen when it is not their turn.
- Above 20 participants, the probabilities and the number of combinations are estimates. For extremely restrictive rules in large groups, the draw is approximately (not exactly) uniform.
- `localStorage` is per browser and per device. Use **Export configuration** to move your setup elsewhere.
- WhatsApp links use `wa.me` without a phone number, so WhatsApp asks you to pick the contact.

## License

MIT
