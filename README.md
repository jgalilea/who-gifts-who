# Who Gifts Who (WGW)

**Who Gifts Who** is a free Secret Santa (*Amigo Invisible*) web app that runs entirely in your browser. It is 100% static (HTML, CSS and vanilla JavaScript modules), with no backend, no database, no build step and no paid services. Upload it to a GitHub repository, turn on GitHub Pages, and it works.

The interface is available in **Spanish and English**, works on phones and desktops, and saves your draft (participants and rules) in the browser's `localStorage`.

## Features

- **Event details** (optional): name, date and budget (a number plus a currency symbol; letters are rejected). They appear in the message and on each person's reveal page, next to their result.
- **Participants**: add, edit and remove people by hand. Names are required and must be unique (case-insensitive). Each person can optionally belong to a **family group** (free text with suggestions) and have a **phone number** (with country code), so the WhatsApp button opens their chat directly.
- **Import** from `.txt`, `.csv` or `.json` files, or paste a list. A preview shows exactly what will be imported and flags empty lines, duplicates and names that already exist.
- **Export** the whole configuration (event, participants, groups, phones and rules) to a JSON file so you can reuse it next year.
- **Rules**:
  - Nobody can gift themselves (always on).
  - *Exclude family members*: nobody gifts someone from their own family group.
  - Individual exclusions ("X cannot gift Y"), one way or both ways.
  - Active rules are listed clearly, and each one can be removed.
- **Previous draws (no repeated pairs)**: keep a list of past draws whose pairings must not repeat. Each one is a rule you can remove, and the pairs are never shown on screen. You can add past draws in three ways:
  - from the current draw (*Organizer options → New draw without repeating pairs*);
  - by importing a draws file;
  - by pasting last year's **secret links** (decrypted locally) or typing pairs by hand (`Ana > Luis`).

  Pairs are stored by name, so they still apply if those people are added later.
- **Export draws**: download only the current draw, or all draws together (current + previous). The file contains who gifts whom, so keep it private.
- **Help**: a *Help* button in the header opens a guide that explains every part of the app.
- **At least 3 participants** are required (with 2, everyone would know who gifts them).
- **Feasibility check**: before the draw, the app checks that at least one valid assignment exists. If none does, it explains why in plain language (e.g. *"Familia García has 5 of 8 people; with family exclusion they can only gift the other 3 people, so no combination is possible"*), and the draw button stays disabled. With up to 20 people it also shows how many valid combinations exist, and warns when there are so few (1 or 2) that people could deduce each other's results.
- **Exact probabilities** (hidden by default): a "who gifts whom" heat map, ranked lists of "you gift…" and "you are gifted by…" for each person, and the total number of valid combinations. They update in real time as participants or rules change.
- **Uniform, secure draw**: every valid assignment is equally likely, so results match the probabilities shown. Randomness comes from `crypto.getRandomValues`. The results are **not shown** to the organizer.
- **Delivery without a server**:
  - **Secret links**: one link per person, with the result encrypted (AES-GCM, Web Crypto API) inside the URL fragment (`#…`), which browsers never send to any server. Each person has a **WhatsApp** button, a **Share** button (Web Share API, where available) and a **Copy link** button.
  - **In person**: the phone is passed from person to person with guided steps. The app shows who to hand the phone to; that person **presses and holds** to see their result (so an accidental double tap can never reveal the next person's result), memorises it, and hides it before passing the phone on.
  - **Reveal all**: an organizer option, behind an explicit confirmation, for when someone loses their link.
- **Draw code**: every draw gets a short code such as `#A7K2`. It is shown to the organizer, included in each message and printed on each person's reveal page. Running the draw again produces a new code, while links already sent keep working and still show the old code. So when you redo a draw, tell the group *"the valid one is #B9X3"*, and anyone holding a link with another code knows it is outdated.
- **Link preview**: shared links show a preview card (title, description and image). The secret part of the link is after `#`, which is never sent to servers or preview crawlers, so the preview cannot reveal anything.
- **No autofill**: form fields opt out of browser autofill, autocomplete history, keyboard suggestions and password-manager overlays. Existing family groups appear as one-tap buttons instead of a suggestion list.
- **Installable**: app icons and a web manifest, so it can be added to the home screen on iOS and Android.

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

One participant per line. Optionally add the family group and the phone number, separated by **semicolons** (`name;group;phone`):

```text
# Lines starting with # are comments
Ana;Familia García;+34 600 123 456
Luis;Familia García
Pedro;Familia López
Marta;;+34 611 222 333
Javier
```

- Supported separators: `;` (recommended), tab, or `,`.
- Values can be wrapped in double quotes if they contain a separator: `"García, Ana";Familia García`.
- An optional header line (`name;group`, `nombre;grupo`) is skipped.
- Phones must start with the country code (`+34…` or `0034…`). A phone without it is dropped (the person is still imported) and the preview says so.
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
    { "name": "Ana", "group": "Familia García", "phone": "+34 600 123 456" },
    { "name": "Luis", "group": "Familia García" },
    { "name": "Marta" },
    { "name": "Javier" }
  ],
  "settings": { "excludeFamily": true },
  "exclusions": [
    { "from": "Marta", "to": "Javier", "mutual": true },
    { "from": "Javier", "to": "Ana", "mutual": false }
  ],
  "event": { "name": "Navidad 2026", "date": "2026-12-24", "budget": "30 €" },
  "previousDraws": [
    {
      "code": "A7K2",
      "label": "Navidad 2025",
      "date": "2025-12-01",
      "pairs": [{ "from": "Ana", "to": "Marta" }, { "from": "Marta", "to": "Luis" }]
    }
  ]
}
```

| Field | Type | Description |
| --- | --- | --- |
| `app` | string | Always `"who-gifts-who"`. Informational. |
| `version` | number | Format version (currently `1`). |
| `exportedAt` | string | ISO date of the export. Informational. |
| `participants` | array | Required. Each item is `{ "name": string, "group"?: string, "phone"?: string }`. |
| `settings.excludeFamily` | boolean | Whether people cannot gift members of their own family group. |
| `exclusions` | array | Each item is `{ "from": name, "to": name, "mutual": boolean }`. `mutual: true` blocks both directions. |
| `event` | object | Optional. `{ "name": string, "date": "YYYY-MM-DD", "budget": string }`. |
| `previousDraws` | array | Optional. Past draws whose pairings must not repeat: `[{ "code", "label", "date", "pairs": [{ "from": name, "to": name }] }]`. |

Participants are referenced **by name**, so the file is easy to read and edit by hand. When importing, `settings`, `event` and `previousDraws` are only applied in **Replace the current list** mode. Exclusions that mention unknown names are ignored.

### Draws file (results)

*Export draw* produces a file with the results, which can be imported later with *Import previous draws*:

```json
{
  "app": "who-gifts-who",
  "kind": "draws",
  "version": 1,
  "exportedAt": "2026-12-01T10:00:00.000Z",
  "draws": [
    { "code": "A7K2", "label": "Navidad 2025", "date": "2025-12-01", "pairs": [{ "from": "Ana", "to": "Marta" }] }
  ]
}
```

*Import previous draws* also accepts a full configuration (its `previousDraws`), pasted secret links (any text containing them, such as a forwarded WhatsApp chat), or pairs typed one per line: `Ana > Luis`, `Ana -> Luis`, `Ana → Luis` or `Ana;Luis`.

## How the maths works

All valid assignments (perfect matchings of the bipartite graph *givers → allowed receivers*) are treated as equally likely.

- **Up to 20 participants: exact.** Dynamic programming over bitmasks counts the valid assignments. `f[mask]` is the number of ways to assign the first *k* givers to the receivers in `mask`, and `g[mask]` is the number of ways to complete the assignment. The number of assignments containing *i → j* is `Σ f[mask] · g[mask ∪ {j}]`, so the probability is that count divided by the total.
- **More than 20: estimated.** The app uses sequential importance sampling (Rasmussen's estimator): givers pick uniformly among the receivers still free, and the product of the number of choices weights each sample. The UI labels these numbers as an estimate.
- **The draw** samples uniformly:
  - **Up to 20 participants**, it picks receivers one by one, weighted by the DP completion counts (exactly uniform).
  - **Above 20**, it uses rejection sampling over uniform random permutations (exactly uniform). If the rules are so tight that rejection keeps failing, it falls back to a Markov chain with swap/3-cycle moves, started from a valid matching (approximately uniform).
  - It never uses the "if you draw yourself, draw again" method, which can dead-end and biases results.
- **Feasibility** is checked with maximum bipartite matching (Kuhn's algorithm). When no assignment exists, Hall's theorem is used to name the group of people who do not have enough possible receivers.
- **Performance**: counting, probabilities and the draw run in a Web Worker (`js/workers/compute-worker.js`), so the page never freezes while you type. A newer request cancels the one in progress. DP buffers are reused between runs, and browsers without module workers fall back to the main thread.

## Project structure

```text
index.html            Organizer app
reveal.html           Page that opens a secret link
favicon.svg           WGW icon
manifest.webmanifest  Web app manifest (home-screen install)
assets/               PNG app icons and the link-preview image (og-image.png)
css/styles.css        Styles (mobile-first, light/dark)
js/app.js             Entry point: wires state, derived data and views
js/reveal.js          Reveal page logic
js/state.js           Observable store + actions (persisted to localStorage)
js/storage.js         Safe localStorage helpers
js/compute.js         Runs heavy tasks in Web Workers (cancellable, with fallback)
js/compute-tasks.js   The heavy tasks themselves (shared by worker and fallback)
js/workers/           Web Worker entry point
js/core/              Pure logic, no DOM (unit-tested in Node)
  participants.js     Participant model and validation
  event.js            Event details (name, date, budget)
  rules.js            Exclusions, "do not repeat" pairs and the "allowed" matrix
  feasibility.js      Matching, feasibility and plain-language reasons
  matching.js         Counting and probabilities (exact DP / sampling)
  draw.js             Uniform draw and draw codes
  history.js          Previous draws: parse, merge, export (pairs by name)
  config-constants.js Identifiers written into exported files
  crypto.js           AES-GCM secret link tokens
  importer.js         .txt/.csv/.json parsing and preview
  config.js           Export / import of the full configuration
  random.js           crypto.getRandomValues helpers
js/i18n/              Translations (es.js, en.js) and helpers
js/ui/                One module per section/dialog, each with render(state, derived)
                      (incl. history-view.js for draws import/export, help-view.js for the guide)
examples/             Sample import files
tests/                Node tests for the logic
```

**Extending the app:** add a view in `js/ui/` that exports a `render(state, derived)` function and register it in `js/app.js`. Add new actions in `js/state.js`, and add text keys to both `js/i18n/es.js` and `js/i18n/en.js`. To add a language, create a new dictionary and register it in `js/i18n/index.js`. Secret link payloads are versioned (`v`) and currently carry the giver, receiver, language, draw code and event details.

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
- secret links decrypt correctly and do not reveal names;
- phones, event details, draw codes and the "do not repeat" rule behave as expected.

Accessibility was checked with [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.1 AA, light and dark themes, every screen) and by measuring text contrast on the heat map.

## Limitations and privacy notes

- **The secret link *is* the key.** The result is encrypted, but the decryption key travels inside the link itself, so that anyone can open their own link without a server. Nobody can read a result just by looking at the URL, but anyone who has the link can open it. In particular, the organizer generates and sends the links, so **they could technically open other people's links**. The organizer is trusted not to peek.
- The draw (including all links) is stored in the organizer's browser (`localStorage`) so the links can be sent again later. Anyone with access to that browser could inspect it. Use **Delete draw** when you are done.
- If you **run the draw again**, links that were already sent keep showing the old result, because each link is self-contained. Resend all links and tell the group the new **draw code**.
- In-person mode relies on people not looking at the screen when it is not their turn.
- Above 20 participants, the probabilities and the number of combinations are estimates. For extremely restrictive rules in large groups, the draw is approximately (not exactly) uniform.
- `localStorage` is per browser and per device. Use **Export configuration** to move your setup elsewhere.
- Without a phone number, WhatsApp links ask you to pick the contact. With one, they open that chat directly.
- The link-preview image uses an absolute URL (`https://jgalilea.github.io/who-gifts-who/assets/og-image.png` in `index.html` and `reveal.html`). If you fork the project, change it to your own address. Messaging apps cache previews, so changes can take a while to show.
- The in-person "press and hold" button works with touch, mouse and keyboard (hold Enter/Space). Screen readers can activate it normally.

## Credits

Brand logos (WhatsApp) come from [Simple Icons](https://simpleicons.org) v16.36.0, licensed CC0-1.0. They are embedded in `js/ui/icons.js`. To add another brand, copy the `d` attribute of its SVG into the `BRANDS` map. Brand names and logos belong to their respective owners.

## License

MIT
