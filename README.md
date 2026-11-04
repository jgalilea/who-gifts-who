# Who Gifts Who (WGW)

**Who Gifts Who** is a free Secret Santa (*Amigo Invisible*) web app that runs entirely in your browser. It is 100% static (HTML, CSS and vanilla JavaScript modules), with no backend, no database, no build step and no paid services. Upload it to a GitHub repository, turn on GitHub Pages, and it works.

**Live app:** <https://jgalilea.github.io/who-gifts-who/>

The interface is in **Spanish and English**, works on phones and desktops (light and dark themes), and saves your draft (event, participants and rules) in the browser's `localStorage`, so nothing is lost on reload.

## Quick start

1. **Participants**: add people one by one, or import a list (`.txt`, `.csv`, `.json` or pasted text).
2. **Rules**: exclude family members, add individual exclusions, or avoid repeating previous draws.
3. **Draw**: tap *Review and draw*. You get a summary to check everything, and can add optional event details (name, date, budget) for the message. Then send each person their **secret link** (WhatsApp, share or copy), or do it **in person** by passing the phone around.

A **sticky bar at the bottom** always shows the next step: add people, see why the rules don't work, draw, or send the results. It takes you there in one tap. **Probabilities** are an optional, advanced section at the end. The **Help** button in the header explains every part of the app.

## Features

### Simple by default
- **Three steps** (participants → rules → draw). Optional and advanced things stay folded until you ask for them: the phone field, the individual-exclusion form, previous draws, event details and probabilities.
- **Sticky action bar** with the next step. It hides while the draw section is on screen and while you type on a phone.
- **Review before drawing**: a summary of participants, rules, possible combinations and event details, with a warning if there are very few combinations or if you are redoing a draw.

### Setup
- **Event details** (optional, inside the draw section): name, date and budget. The budget is a number plus a currency symbol, and letters are rejected. These details appear in the message and on each person's reveal page, next to their result.
- **Participants**: add, edit and remove people. Names are required and unique (case-insensitive). Each person can optionally have:
  - a **family group**: free text, with existing groups offered as one-tap buttons;
  - a **phone number** with country code: the WhatsApp button then opens their chat directly.
- **Import** from `.txt`, `.csv` or `.json`, or paste a list. A preview shows exactly what will be imported and flags empty lines, duplicates, names already on the list and unusable phone numbers.
- **Export configuration**: event, participants, groups, phones, rules and previous draws in one JSON file, to reuse next year.
- **At least 3 participants** (with 2, everyone would know who gifts them).

### Rules
- Nobody can gift themselves (always on).
- **Exclude family members**: nobody gifts someone from their own family group.
- **Individual exclusions** ("X cannot gift Y"), one way or both ways.
- **Previous draws (no repeated pairs)**: a list of past draws whose pairings must not repeat. Each one is a rule you can remove, and its pairs are never shown on screen. You can add a past draw in three ways:
  - from the current draw (*Organizer options → New draw without repeating pairs*);
  - by importing a draws file or a configuration;
  - by pasting last year's **secret links** (decrypted on your device) or typing pairs by hand (`Ana > Luis`).

  Pairs are stored by name, so they apply as soon as those people are on the list.
- **Feasibility check**: before the draw, the app checks that at least one valid assignment exists. If none does, it explains why in plain language (e.g. *"Familia García has 5 of 8 people; with family exclusion they can only gift the other 3 people, so no combination is possible"*) and blocks the draw. With up to 20 people it also shows how many combinations exist, and warns when there are so few (1 or 2) that people could deduce each other's results.

### Probabilities
- Hidden by default. When shown, you get:
  - a "who gifts whom" **heat map**;
  - for the selected person, ranked lists of "you gift…" and "you are gifted by…";
  - the total number of valid combinations.
- **Exact up to 20 people**, estimated by sampling above that (labelled as such).
- Recomputed in real time, in a background thread, whenever participants or rules change.

### The draw
- **Uniform and secure**: every valid assignment is equally likely, so results match the probabilities shown. Randomness comes from `crypto.getRandomValues`.
- **Results are never shown to the organizer** unless they explicitly ask for them.
- **Draw code**: every draw gets a short code such as `#A7K2`, shown to the organizer, in each message and on each reveal page. If you run the draw again, the code changes, but links already sent still open and show the old code. Tell the group *"the valid one is #B9X3"*, and anyone holding a link with another code knows it is outdated.

### Delivering the results (no server)
- **Secret links**: one link per person. The result is encrypted (AES-GCM, Web Crypto API) inside the URL fragment (`#…`), which browsers never send to any server. Each person has three buttons:
  - **WhatsApp**: a `wa.me` link with a ready-made message;
  - **Share**: the Web Share API, where available;
  - **Copy link**.
- **Reveal page**: shows *"Hi, [name]"*, a gift that opens with a short animation, then the receiver's name and the event details. The page is laid out before the link is decrypted, so nothing jumps around while it loads.
- **Link preview card**: shared links show a title, description and image. The secret part (after `#`) never reaches preview crawlers, so the preview cannot reveal anything.
- **In person**: the phone is passed around with guided steps. The app says who to hand the phone to. That person **presses and holds** the button to see their result, so an accidental double tap can never reveal someone else's. They memorise it, hide it, and pass the phone on. Exiting asks for confirmation on the same screen.
- **Organizer options**:
  - reveal all results (behind an explicit confirmation, for lost links);
  - run the draw again;
  - **export the draw** (only the current one, or all together with previous draws);
  - start a new draw without repeating pairs;
  - delete the draw.

### Usability
- Collapsible sections (remembered per device), mobile-first layout, light/dark themes and reduced-motion support.
- Form fields opt out of browser autofill, autocomplete history, keyboard suggestions and password-manager overlays.
- Installable: PNG app icons and a web manifest for the home screen on iOS and Android.
- Accessible: labels, keyboard support, visible focus, 44 px touch targets, and colour contrast checked in both themes.

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

**If you fork the project**, update the link-preview image URL (`og:image`, currently `https://jgalilea.github.io/who-gifts-who/assets/og-image.png`) in `index.html` and `reveal.html`. Messaging apps need an absolute URL there.

### Deploying updates (avoid stale caches)

GitHub Pages lets browsers cache files for 10 minutes, so right after a deploy a phone could mix new HTML with old CSS/JS. To avoid that, run this before pushing:

```bash
node scripts/update-version.mjs   # or: npm run version:assets
```

It hashes every CSS/JS file and writes `?v=<hash>` into `index.html` and `reveal.html`: the stylesheet, the scripts, the preloads, and an import map that versions every module. It is optional, and the app works without it. Modules loaded inside the Web Worker can't be versioned this way, because browsers don't apply import maps in workers.

### Running locally

ES modules need to be served over HTTP (opening `index.html` directly with `file://` will not work):

```bash
python3 -m http.server 8000   # or: npm start
# open http://localhost:8000/
```

## Import file formats

Sample files are in [`examples/`](examples/) (`participants.txt`, `participants.csv`, `participants.json`).

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
- An optional header line (`name;group;phone`, `nombre;grupo`…) is skipped.
- Phones must start with the country code (`+34…` or `0034…`). A phone without it is dropped (the person is still imported), and the preview says so.
- Empty lines, duplicate names and names already on the list are shown in the preview and skipped.
- Names and groups are limited to 60 characters. Name and group matching is case-insensitive.

### JSON (`.json`)

Any of these shapes are accepted:

```json
["Ana", "Luis", "Marta"]
```

```json
[{ "name": "Ana", "group": "Familia García", "phone": "+34 600 123 456" }, { "name": "Marta" }]
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
| `event` | object | Optional. `{ "name": string, "date": "YYYY-MM-DD", "budget": string }`. The budget is a number plus a currency symbol (`"30 €"`, `"£25"`); other text is normalised. |
| `previousDraws` | array | Optional. Past draws whose pairings must not repeat: `[{ "code", "label", "date", "pairs": [{ "from": name, "to": name }] }]`. |

Participants are referenced **by name**, so the file is easy to read and edit by hand. When importing:
- `settings`, `event` and `previousDraws` are only applied in **Replace the current list** mode.
- Exclusions that mention unknown names are ignored.

### Draws file (results)

*Export draw* produces a file with the results. It can be imported later with *Import previous draws*:

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

*Import previous draws* also accepts:
- a full configuration (its `previousDraws`);
- pasted secret links: any text that contains them, such as a forwarded WhatsApp chat. Links are grouped by draw code;
- pairs typed one per line: `Ana > Luis`, `Ana -> Luis`, `Ana → Luis` or `Ana;Luis`.

## How the maths works

All valid assignments (perfect matchings of the bipartite graph *givers → allowed receivers*) are treated as equally likely.

- **Up to 20 participants: exact.** Dynamic programming over bitmasks counts the valid assignments. `f[mask]` is the number of ways to assign the first *k* givers to the receivers in `mask`, and `g[mask]` is the number of ways to complete the assignment. The number of assignments containing *i → j* is `Σ f[mask] · g[mask ∪ {j}]`, and dividing by the total gives the probability.
- **More than 20: estimated.** Sequential importance sampling (Rasmussen's estimator): givers pick uniformly among the receivers still free, and the product of the number of choices weights each sample. The UI labels these numbers as an estimate.
- **The draw** samples uniformly:
  - **up to 20 participants**: receivers are picked one by one, weighted by the DP completion counts (exactly uniform);
  - **above 20**: rejection sampling over uniform random permutations (exactly uniform). If the rules are so tight that rejection keeps failing, the app falls back to a Markov chain with swap/3-cycle moves started from a valid matching (approximately uniform);
  - it never uses the "if you draw yourself, draw again" method, which can dead-end and biases results.
- **Feasibility** uses maximum bipartite matching (Kuhn's algorithm). When no assignment exists, Hall's theorem names the group of people who do not have enough possible receivers.
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
  participants.js     Participant model, validation and phone numbers
  event.js            Event details (name, date, budget)
  rules.js            Exclusions, previous-draw pairs and the "allowed" matrix
  feasibility.js      Matching, feasibility and plain-language reasons
  matching.js         Counting and probabilities (exact DP / sampling)
  draw.js             Uniform draw and draw codes
  history.js          Previous draws: parse, merge, export (pairs by name)
  crypto.js           AES-GCM secret link tokens
  importer.js         .txt/.csv/.json parsing and preview
  config.js           Export / import of the full configuration
  config-constants.js Identifiers written into exported files
  random.js           crypto.getRandomValues helpers
js/i18n/              Translations (es.js, en.js) and formatting helpers
js/ui/                One module per section or dialog, each with render(state, derived):
                      event, participants, import, rules, probabilities, draw,
                      summary (review before drawing), action-bar (sticky next step),
                      in-person, history (draws import/export), help, sections,
                      plus shared helpers (dom, feedback, share, icons, rule-texts,
                      count-service)
scripts/              Optional maintenance scripts (update-version.mjs: cache busting)
examples/             Sample import files
tests/                Node tests for the logic
```

**Extending the app:**
- **A new section or dialog:** add a view in `js/ui/` that exports a `render(state, derived)` function, and register it in `js/app.js`.
- **New actions:** add them in `js/state.js`.
- **New texts:** add each key to both `js/i18n/es.js` and `js/i18n/en.js`; help topics live there too (`help.<topic>.*`).
- **A new language:** create a dictionary and register it in `js/i18n/index.js`.
- **Secret link payloads** are versioned (`v`) and currently carry the giver, receiver, language, draw code and event details.

## Tests

The tests need Node.js 20+ and have no dependencies:

```bash
npm test
```

The 42 tests check that:

- nobody gifts themselves;
- family groups, exclusions and previous draws are respected, including in large groups;
- impossible configurations are detected and explained;
- exact counts match known values (derangements) and brute force;
- **draw frequencies match the computed probabilities** over many draws, and every valid assignment is equally likely (chi-square test);
- import/export round trips work, and the example files import cleanly;
- secret links decrypt correctly, do not reveal names, and can be turned back into a previous draw;
- phones, budgets, event details and draw codes behave as expected.

Accessibility was checked with [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.1 AA, light and dark themes, every screen and dialog) and by measuring text contrast on the heat map.

## Limitations and privacy notes

- **The secret link *is* the key.** The result is encrypted, but the decryption key travels inside the link itself, so anyone can open their own link without a server. Nobody can read a result just by looking at the URL, but anyone who has the link can open it. In particular, the organizer generates and sends the links, so **they could technically open other people's links**. The organizer is trusted not to peek.
- The draw (including all links) is stored in the organizer's browser (`localStorage`) so the links can be sent again later. Anyone with access to that browser could inspect it. Use **Delete draw** when you are done.
- **Exported draw files contain who gifts whom.** Keep them private.
- If you **run the draw again**, links already sent keep showing the old result, because each link is self-contained. Resend all links and tell the group the new **draw code**.
- In-person mode relies on people not looking at the screen when it is not their turn.
- Above 20 participants, the probabilities and the number of combinations are estimates. For extremely restrictive rules in large groups, the draw is approximately (not exactly) uniform.
- `localStorage` is per browser and per device. Use **Export configuration** to move your setup elsewhere.
- Without a phone number, WhatsApp links ask you to pick the contact. With one, they open that chat directly.
- Previous-draw pairs are matched by name: if you rename someone, their old pairs no longer apply to them.
- Browsers are asked not to autofill, but some (notably Safari on iOS) may still offer contact suggestions.
- Messaging apps cache link previews, so a changed preview image can take a while to show.
- The in-person "press and hold" button works with touch, mouse and keyboard (hold Enter/Space). Screen readers can activate it normally.

## Credits

Brand logos (WhatsApp) come from [Simple Icons](https://simpleicons.org) v16.36.0, licensed CC0-1.0. They are embedded in `js/ui/icons.js`. To add another brand, copy the `d` attribute of its SVG into the `BRANDS` map. Brand names and logos belong to their respective owners.

## License

[MIT](LICENSE) © 2026 Javier Galilea
