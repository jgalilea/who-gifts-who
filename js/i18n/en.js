// English dictionary. Keep the same keys as es.js.
const plural = (n, one, many) => (n === 1 ? one : many);

export default {
  'app.skip': 'Skip to content',
  'app.tagline': 'Secret Santa made simple',
  'app.language': 'Language',
  'app.footer': 'Everything happens in your browser: no server, no database. Your draft is saved on this device.',

  'common.optional': '(optional)',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.remove': 'Remove',

  'participants.title': 'Participants',
  'participants.name': 'Name',
  'participants.group': 'Family group',
  'participants.groupPlaceholder': 'e.g. The Smiths',
  'participants.add': 'Add',
  'participants.empty': 'No participants yet. Add them one by one or import a list.',
  'participants.count': ({ count }) => `${count} ${plural(count, 'person', 'people')}`,
  'participants.editLabel': 'Edit {name}',
  'participants.removeLabel': 'Remove {name}',
  'participants.removed': '{name} removed from the list',
  'participants.clear': 'Clear everything',
  'participants.clearTitle': 'Clear everything?',
  'participants.clearMessage': 'Participants, rules and the saved draw will be deleted from this device. Export the configuration first if you want to keep it.',

  'errors.nameRequired': 'Please enter a name.',
  'errors.nameTooLong': 'The name is too long (60 characters max).',
  'errors.groupTooLong': 'The group is too long (60 characters max).',
  'errors.nameDuplicate': 'Someone already has that name. Add an initial or surname to tell them apart.',
  'errors.exclusionSame': 'Pick two different people.',
  'errors.exclusionMissing': 'Pick both people.',
  'errors.exclusionDuplicate': 'That exclusion already exists.',

  'import.open': 'Import list',
  'import.title': 'Import participants',
  'import.help': 'Upload a <strong>.txt</strong> or <strong>.csv</strong> file with one name per line. Optionally add the family group and phone number, separated by semicolons: <code>Ana;The Smiths;+44 7700 900123</code>. <strong>.json</strong> files exported from this app work too.',
  'import.file': 'File',
  'import.chooseFile': 'Choose file…',
  'import.paste': '…or paste the list here',
  'import.placeholder': 'Ana;The Smiths\nLuis;The Smiths;+44 7700 900123\nMarta',
  'import.mode': 'What should happen to the current list?',
  'import.modeAdd': 'Add to the current list',
  'import.modeReplace': 'Replace the current list (and its rules)',
  'import.confirm': ({ count }) => (count ? `Import ${count} ${plural(count, 'person', 'people')}` : 'Import'),
  'import.summary': ({ ok, skipped }) =>
    `${ok} ${plural(ok, 'person', 'people')} ready to import` +
    (skipped ? ` · ${skipped} ${plural(skipped, 'line', 'lines')} will be skipped` : ''),
  'import.issueEmpty': 'Line {line}: empty, it will be ignored.',
  'import.issueDuplicate': 'Line {line}: “{name}” appears twice in the list, it will be ignored.',
  'import.issueExists': 'Line {line}: “{name}” is already a participant, it will be ignored.',
  'import.issueTooLong': 'Line {line}: name or group too long (60 characters max).',
  'import.issueInvalid': 'Item {line}: invalid format, it will be ignored.',
  'import.invalidJson': 'The JSON file is not valid: {detail}',
  'import.jsonShape': 'The JSON must be a list of names or an object with "participants". See the README.',
  'import.extraExclusions': ({ count }) => `${count} ${plural(count, 'exclusion', 'exclusions')} will be imported too.`,
  'import.extraFamily': 'The “Exclude family members” rule will be turned on.',
  'import.settingsIgnored': 'Settings from the file are only applied when replacing the list.',
  'import.previewCaption': 'Import preview',
  'import.done': ({ count }) => `${count} ${plural(count, 'person', 'people')} imported`,

  'export.button': 'Export configuration',
  'export.done': 'Configuration downloaded. Keep it for next year.',

  'rules.title': 'Rules',
  'rules.excludeFamily': 'Exclude family members',
  'rules.excludeFamilyHint': 'Nobody will gift someone from their own family group.',
  'rules.exclusionTitle': 'Individual exclusion',
  'rules.from': 'Who',
  'rules.to': 'Cannot gift',
  'rules.direction': 'Direction',
  'rules.oneWay': 'One way only',
  'rules.bothWays': 'Both ways',
  'rules.addExclusion': 'Add exclusion',
  'rules.choose': 'Choose…',
  'rules.active': 'Active rules',
  'rules.always': 'Always on',
  'rules.noSelf': 'Nobody can gift themselves.',
  'rules.familyActive': 'Exclude family members: {groups}.',
  'rules.familyNoGroups': 'Exclude family members (no participant has a family group yet).',
  'rules.removeFamily': 'Turn off “Exclude family members”',
  'rules.oneWayRule': '{from} cannot gift {to}.',
  'rules.mutual': '{from} and {to} cannot gift each other.',
  'rules.removeLabel': 'Remove rule: {rule}',

  'feasibility.ok': 'Valid assignments exist with these rules. Ready to draw!',
  'feasibility.notPossible': 'No valid combination exists.',
  'feasibility.tooFew': ({ min }) => `You need at least ${min} participants.`,
  'feasibility.noReceivers': '{name} cannot gift anyone with the current rules.',
  'feasibility.noGivers': 'Nobody can gift {name} with the current rules.',
  'feasibility.familyTooLarge': ({ group, size, total, others }) =>
    `${group} has ${size} of ${total} people; with family exclusion they can only gift the other ${others} ${plural(others, 'person', 'people')}, so no combination is possible.`,
  'feasibility.hall': ({ givers, receivers, giverCount, receiverCount }) =>
    `Between them, ${givers} (${giverCount} people) can only gift ${receivers} (${receiverCount} ${plural(receiverCount, 'person', 'people')}). There are not enough receivers: remove an exclusion.`,

  'prob.title': 'Probabilities',
  'prob.toggle': 'Show probabilities',
  'prob.toggleHint': 'Computes the probability of each pairing under the active rules. Hidden so nobody is influenced.',
  'prob.calculating': 'Calculating…',
  'prob.needMore': 'Add at least three participants to see probabilities.',
  'prob.none': 'No valid combinations exist with the current rules.',
  'prob.total': 'Valid combinations:',
  'prob.exactNote': 'exact calculation; all of them are equally likely.',
  'prob.estimateNote': 'sampling estimate ({samples} samples), because there are more than {limit} participants.',
  'prob.person': 'Person',
  'prob.gives': 'Probability that {name} gifts…',
  'prob.receives': 'Probability that {name} is gifted by…',
  'prob.matrix': 'Matrix: who gifts whom',
  'prob.matrixHint': 'Each row is the giver, each column the receiver. “—”: not allowed by a rule. “0%”: no rule forbids it, but the other rules mean it can never happen (e.g. those people must gift someone else).',
  'prob.matrixCaption': 'Probability that the person in each row gifts the person in each column',
  'prob.giverAxis': 'Gives ↓',
  'prob.receiverAxis': 'Receives →',
  'prob.notAllowed': 'not allowed',

  'draw.title': 'Draw',
  'draw.intro': 'Before drawing you will see a summary to check everything. The app randomly picks one of all valid combinations, each equally likely, and will not show the results on this screen.',
  'draw.button': 'Review and draw',
  'draw.doneToast': 'Draw complete. Results are hidden.',
  'draw.error': 'The draw could not be completed. Check the rules.',
  'draw.doneTitle': 'Draw complete.',
  'draw.doneText': ({ date, count }) => `${date} · ${count} people. Results are hidden: not even you can see them here.`,
  'draw.stale': 'You changed participants, rules or event details after the draw. The generated links show the previous result and details: run the draw again to apply the changes.',
  'draw.deliveryMode': 'How to deliver the results',
  'draw.tabLinks': 'Send links',
  'draw.tabInPerson': 'In person',
  'draw.linksHint': 'Each person gets a secret link that only shows their own result. The result is encrypted inside the link itself.',
  'draw.inPersonHint': 'Pass the phone around. At every moment the app tells you who to hand it to and which button to press.',
  'draw.startInPerson': 'Start in-person reveal',
  'draw.organizerOptions': 'Organizer options',
  'draw.revealAll': 'Reveal all results',
  'draw.revealAllTitle': 'See all results?',
  'draw.revealAllMessage': 'Only use this if someone lost their link. You will see who gifts whom and it will no longer be a surprise for you.',
  'draw.revealAllCheck': 'I understand I am about to see every result.',
  'draw.revealAllConfirm': 'Reveal',
  'draw.allResults': 'All results',
  'draw.hideAll': 'Hide results',
  'draw.gives': 'gifts',
  'draw.redo': 'Run the draw again',
  'draw.discard': 'Delete draw',
  'draw.discardTitle': 'Delete the draw?',
  'draw.discardMessage': 'The draw will be deleted from this device. Links already sent will keep working.',

  'share.whatsapp': 'WhatsApp',
  'share.whatsappLabel': 'Send {name}’s link via WhatsApp',
  'share.share': 'Share',
  'share.shareLabel': 'Share {name}’s link',
  'share.copy': 'Copy link',
  'share.copyLabel': 'Copy {name}’s link',
  'share.copied': '{name}’s link copied',
  'share.copyError': 'Could not copy the link',
  'share.shareError': 'Could not share the link',
  'share.message': ({ name, url, event, code }) => `Hi ${name}, the Secret Santa draw${event ? ` “${event}”` : ''} is done${code ? ` (code #${code})` : ''}. This link shows who you are giving a present to; it is just for you:\n${url}`,
  'share.shareText': ({ name, event }) => `Hi ${name}, this is your Secret Santa link${event ? ` for “${event}”` : ''}: it shows who you are giving a present to. It is just for you.`,

  'inperson.exit': 'Exit',
  'inperson.exitTitle': 'Leave the in-person reveal?',
  'inperson.exitMessage': 'If you leave, you can start again from the first person whenever you want.',
  'inperson.instructions': '{name}: once you are holding the phone and nobody else can see the screen, press and hold the button.',
  'inperson.youGift': '{name}, you are gifting',
  'inperson.hideNext': 'Hide and pass the phone to {next}',
  'inperson.hideLast': 'Hide and finish',
  'inperson.progress': '{current} of {total}',
  'inperson.progressDone': '{total} of {total}',
  'inperson.introTitle': 'How it works',
  'inperson.introStep1': 'The app shows whose turn it is. <strong>Hand the phone to that person.</strong>',
  'inperson.introStep2': 'That person, and only them, <strong>presses and holds</strong> the button to see their result.',
  'inperson.introStep3': 'They memorise it and tap <strong>Hide</strong>. The result disappears from the screen.',
  'inperson.introStep4': 'The app shows the next person’s name: hand them the phone and repeat.',
  'inperson.begin': 'Got it, start',
  'inperson.step1': 'Step 1 of 2 · Hand over the phone',
  'inperson.step2': 'Step 2 of 2 · Memorise and hide',
  'inperson.passTo': 'Hand the phone to',
  'inperson.holdToReveal': 'I’m {name}: press and hold',
  'inperson.holdToRevealAria': 'I’m {name}: press and hold to see my result',
  'inperson.holdHint': 'Keep holding until the button fills up.',
  'inperson.onlyYou': '🤫 Only {name} should see this screen',
  'inperson.memorizeNext': 'Memorise it. Then tap the button to hide it and hand the phone to {next}.',
  'inperson.memorizeLast': 'Memorise it and tap the button to hide it. You are the last one!',
  'inperson.exitCancel': 'Continue the draw',
  'draw.organizerHint': 'Tap to expand: reveal all, redo or delete the draw',
  'draw.badgeDone': 'Done',
  'draw.badgeReady': 'Pending',
  'draw.badgeBlocked': 'Blocked',
  'rules.badge': ({ count }) => `${count} ${plural(count, 'rule', 'rules')}`,
  'rules.badgeBlocked': 'No solution',
  'inperson.doneTitle': 'Everyone has their Secret Santa!',
  'inperson.finish': 'Finish',

  'reveal.errorTitle': 'Invalid link',
  'reveal.errorText': 'This link is incomplete or damaged. Ask the organizer to send it again.',
  'reveal.hello': 'Hi,',
  'reveal.intro': 'Your Secret Santa match is waiting inside this gift.',
  'reveal.button': 'Find out who I’m gifting',
  'reveal.youGift': 'You are gifting…',
  'reveal.keepSecret': 'Shhh! Keep it secret 🤫',
  'reveal.createOwn': 'Organize your own Secret Santa with Who Gifts Who',
  'event.title': 'Details for the message',
  'event.hint': 'Optional. Shown in the message and on each participant’s page, next to their result.',
  'event.name': 'Event name',
  'event.namePlaceholder': 'e.g. Family Christmas 2026',
  'event.date': 'Date',
  'event.budget': 'Budget',
  'event.budgetPlaceholder': '25',
  'event.currency': 'Currency',
  'event.badgeEmpty': 'Optional: event name, date and budget',
  'participants.phone': 'Phone',
  'participants.phonePlaceholder': '+44 7700 900123',
  'participants.phoneHint': 'Include the country code. Used to open their WhatsApp chat directly.',
  'participants.existingGroups': 'Existing groups',
  'errors.phoneInvalid': 'That phone number does not look valid. Include the country code, e.g. +44 7700 900123.',
  'errors.phoneNoPrefix': 'Add the country code at the start, e.g. +44 7700 900123.',
  'import.issuePhone': 'Line {line}: “{name}” has an invalid phone (missing country code?); they will be imported without it.',
  'import.extraEvent': 'Event details will be imported.',
  'import.extraPrevious': ({ count }) => `${count} previous ${plural(count, 'draw', 'draws')} will be imported so pairings are not repeated.`,
  'feasibility.combinations': 'There are {count} possible combinations.',
  'feasibility.fewCombinations': ({ count }) => count === 1 ? 'Only 1 combination is possible: the result is decided in advance. Add people or remove rules.' : `Only ${count} combinations are possible: anyone who knows their result can deduce the others. Add people or remove rules.`,
  'draw.codeLabel': 'Draw code',
  'draw.codeHint': 'Shown in the message and on every link page. If you run the draw again the code changes: tell the group which code is valid, so nobody trusts an old link.',
  'draw.next': 'New draw without repeating pairs',
  'draw.nextTitle': 'Prepare a new draw without repeating pairs?',
  'draw.nextMessage': 'Meant for next year. This draw’s pairings are saved as a “previous draw” (without showing who gifted whom) and this draw is deleted from this device. Links already sent keep working. If you export the configuration, it is included in the file.',
  'draw.nextDone': 'Done: the next draw will not repeat the previous pairings.',
  'reveal.event': 'Event',
  'reveal.date': 'Date',
  'reveal.budget': 'Budget',
  'reveal.code': 'Draw code',
  'reveal.notSet': 'Not set',
  'rules.previousRule': ({ draw, applies, total }) => `Do not repeat pairings of ${draw}` + (applies === total ? ` (${total} ${plural(total, 'pair', 'pairs')}).` : ` (${applies} of ${total} pairs apply to the current participants).`),
  'history.title': 'Previous draws',
  'history.hint': 'To avoid repeating pairings from previous years.',
  'history.import': 'Import previous draws',
  'history.export': 'Export draws',
  'history.exportDraw': 'Export draw',
  'history.unnamed': 'unnamed',
  'history.importTitle': 'Import previous draws',
  'history.importHelp': 'Upload a file exported with “Export draw” (or a configuration that includes draws), <strong>paste the secret links</strong> of a previous draw (decrypted on your device) or <strong>type the pairs</strong>, one per line: <code>Ana &gt; Luis</code>.',
  'history.paste': '…or paste the links or pairs here',
  'history.placeholder': 'Ana > Luis\nLuis > Marta\nMarta > Ana\n\nor paste the links: https://…/reveal.html#…',
  'history.label': 'Draw name',
  'history.labelPlaceholder': 'e.g. Christmas 2024',
  'history.labelHint': 'Only for pairs typed by hand. Links and files already carry their own.',
  'history.importConfirm': ({ count }) => (count ? `Import ${count} ${plural(count, 'draw', 'draws')}` : 'Import'),
  'history.found': ({ count }) => `${count} ${plural(count, 'draw', 'draws')} found:`,
  'history.nothingFound': 'No valid pairs or links found.',
  'history.pairs': ({ count }) => `${count} ${plural(count, 'pair', 'pairs')}`,
  'history.alreadyImported': 'already imported',
  'history.unknownNames': ({ count }) => `${count} ${plural(count, 'pair mentions', 'pairs mention')} people who are not on the list: kept in case you add them later.`,
  'history.invalidLine': 'Line {line}: pair not understood (use “Ana > Luis”); it will be ignored.',
  'history.badLinks': ({ count }) => `${count} invalid or damaged ${plural(count, 'link', 'links')}; ignored.`,
  'history.noDrawsInFile': 'The file does not contain any draw.',
  'history.imported': ({ count }) => `${count} previous ${plural(count, 'draw', 'draws')} imported`,
  'history.exportTitle': 'Export draws',
  'history.exportWhat': 'What do you want to export?',
  'history.exportCurrent': ({ code }) => `Only the current draw ${code}`,
  'history.exportCurrentNone': 'Only the current draw (there is none)',
  'history.exportAll': ({ count }) => `All together: the current and previous ones (${count} ${plural(count, 'draw', 'draws')})`,
  'history.exportAllPrevious': ({ count }) => `All saved previous draws (${count})`,
  'history.exportWarning': 'The file contains who gifts whom. Keep it somewhere private and don’t share it before the event.',
  'history.exportConfirm': 'Download',
  'history.exported': ({ count }) => `${count} ${plural(count, 'draw', 'draws')} exported`,
  'help.button': 'Help',
  'help.title': 'How it works',
  'help.intro': 'Tap a topic to expand it.',
  'help.close': 'Close',
  'help.start.title': `How it works, in short`,
  'help.start.body': `<p><strong>Who Gifts Who</strong> runs a Secret Santa without a server: everything happens in your browser and is saved on this device.</p>
<ol>
<li><strong>Participants</strong>: add them by hand or import a list.</li>
<li><strong>Rules</strong>: who cannot gift whom (e.g. families).</li>
<li><strong>Draw</strong>: review the summary, draw, and deliver the results by secret link or in person.</li>
</ol>
<p>The <strong>bar at the bottom</strong> always tells you the next step and takes you there in one tap.</p>
<p>Optionally add <strong>details for the message</strong> (name, date and budget) and check the <strong>probabilities</strong> (advanced). Each section can be collapsed by tapping its title.</p>`,
  'help.event.title': `Details for the message (optional)`,
  'help.event.body': `<p>They are inside the <strong>Draw</strong> section, folded. Event name, date and budget (a number and the currency) are optional. If you fill them in, they appear in the message you send and on each participant’s page, next to their result.</p>
<p>You can also add them from the summary before drawing. If you change them after the draw, links already generated keep the old details: the app warns you so you can run the draw again.</p>`,
  'help.participants.title': `1 · Participants`,
  'help.participants.body': `<ul>
<li><strong>Name</strong>: required and unique (case-insensitive).</li>
<li><strong>Family group</strong>: optional. Used by the “Exclude family members” rule. Existing groups appear as buttons you can pick with one tap.</li>
<li><strong>Phone</strong>: optional (tap “+ Add phone”), with country code (+44…). With it, the WhatsApp button opens their chat directly.</li>
</ul>
<p><strong>Import list</strong>: upload a .txt or .csv with one person per line (<code>name;group;phone</code>), paste the list, or use an exported .json. You get a preview with warnings before confirming.</p>
<p><strong>Export configuration</strong>: downloads everything (event, participants, rules and previous draws) to reuse next year. It does not include the current draw’s results.</p>`,
  'help.rules.title': `2 · Rules`,
  'help.rules.body': `<ul>
<li><strong>Nobody gifts themselves</strong>: always on.</li>
<li><strong>Exclude family members</strong>: nobody gifts someone from their own family group.</li>
<li><strong>Individual exclusion</strong> (tap “+ Add individual exclusion”): “X cannot gift Y”, one way or both ways (e.g. couples).</li>
</ul>
<p>Below you can see whether valid combinations exist and how many. If none do, the app explains why and blocks the draw. If there are very few (1 or 2), it warns you: someone could deduce the others’ results.</p>`,
  'help.previous.title': `Previous draws (no repeated pairs)`,
  'help.previous.body': `<p>Prevents pairings from previous years from repeating. Each previous draw is a rule you can remove at any time. The pairs are <strong>never shown</strong>: you only see “Do not repeat the pairings of…”.</p>
<p>Three ways to add a previous draw:</p>
<ul>
<li><strong>From the current draw</strong>: in “Organizer options”, tap “New draw without repeating pairs”.</li>
<li><strong>Import a file</strong> exported with “Export draw/draws” (or a configuration that includes them).</li>
<li><strong>Paste last year’s secret links</strong> (decrypted on your device) or <strong>type the pairs</strong>, one per line: <code>Ana &gt; Luis</code>.</li>
</ul>
<p>Pairs are stored by name: if someone no longer takes part, their pair simply does not apply.</p>`,
  'help.probabilities.title': `Probabilities (advanced)`,
  'help.probabilities.body': `<p>Optional, at the end of the page and hidden by default so nobody is influenced. When shown you get:</p>
<ul>
<li>The <strong>number of valid combinations</strong>.</li>
<li>For each person, the probability of gifting each other person and of being gifted by each of them.</li>
<li>A “who gifts whom” <strong>matrix</strong>: rows = giver, columns = receiver. “—” = forbidden by a rule; “0%” = allowed, but the other rules mean it never happens.</li>
</ul>
<p>Up to 20 people the calculation is exact; above that it is a sampling estimate (labelled as such).</p>`,
  'help.draw.title': `3 · Draw`,
  'help.draw.body': `<p>Tap <strong>Review and draw</strong> (or “Draw” in the bottom bar). You get a <strong>summary</strong> of participants, rules, possible combinations and event details; if everything looks right, confirm.</p>
<p>The app randomly picks <strong>one of all valid combinations</strong>, each equally likely, using the browser’s secure random generator. After the draw <strong>nobody sees the results on screen</strong>, not even the organizer. Then you choose how to deliver them: links or in person.</p>`,
  'help.links.title': `Delivering by secret link`,
  'help.links.body': `<p>Each person gets their own link. The result is <strong>encrypted inside the link</strong> (after “#”), so it never goes through a server and can’t be read from the address.</p>
<ul>
<li><strong>WhatsApp</strong>: opens WhatsApp with the message ready (straight into their chat if they have a phone).</li>
<li><strong>Share</strong>: uses your phone’s share menu (when available).</li>
<li><strong>Copy link</strong>: send it any way you like.</li>
</ul>
<p>When opened, the person sees “Hi, [name]”, taps “Find out who I’m gifting” and the result appears with the event details.</p>`,
  'help.inperson.title': `Delivering in person (pass the phone)`,
  'help.inperson.body': `<ol>
<li>The app shows whose turn it is: <strong>hand the phone to that person</strong>.</li>
<li>That person, and only them, <strong>presses and holds</strong> the button until it fills up to see their result. Holding prevents an accidental double tap from revealing someone else’s.</li>
<li>They memorise it and tap <strong>Hide</strong>: the result disappears from the screen.</li>
<li>The app says who to hand the phone to next. Repeat until the end.</li>
</ol>
<p>“Exit” asks for confirmation on the same screen and never shows a result again.</p>`,
  'help.code.title': `The draw code`,
  'help.code.body': `<p>Every draw has a short code, e.g. <strong>#A7K2</strong>. It appears in the message and on every link page.</p>
<p>If you run the draw again the code changes, but links you already sent still open (they can’t be revoked without a server). Tell the group which code is valid: anyone opening a link with another code knows it is outdated.</p>`,
  'help.organizer.title': `Organizer options`,
  'help.organizer.body': `<ul>
<li><strong>Reveal all results</strong>: only if someone loses their link. Requires explicit confirmation.</li>
<li><strong>Run the draw again</strong>: a new draw with new links and a new code.</li>
<li><strong>Export draw</strong>: downloads the result (only the current one, or all together with the previous ones). The file contains who gifts whom: keep it private.</li>
<li><strong>New draw without repeating pairs</strong>: saves this draw as “previous” and clears it, ready to draw again.</li>
<li><strong>Delete draw</strong>: removes it from this device; links already sent keep working.</li>
</ul>`,
  'help.nextYear.title': `For next year`,
  'help.nextYear.body': `<ol>
<li>After the event, in “Organizer options”, tap <strong>New draw without repeating pairs</strong> (or “Export draw” to keep it separately).</li>
<li>Tap <strong>Export configuration</strong> and keep the file.</li>
<li>Next year: <strong>Import list</strong> → choose the file → “Replace the current list”. Participants, rules and previous draws come back.</li>
</ol>`,
  'help.privacy.title': `Privacy and limitations`,
  'help.privacy.body': `<ul>
<li>No server, no database: everything is stored in this browser. To switch devices, export the configuration.</li>
<li>The link <strong>is the key</strong>: it is encrypted, but whoever has the link can open it. So the organizer could technically open other people’s links; they are trusted not to.</li>
<li>The draw and its links are stored on this device so you can resend them. Use “Delete draw” when you are done if you prefer.</li>
<li>Link previews (in WhatsApp, etc.) never show the result.</li>
</ul>`,
  'participants.addPhone': '+ Add phone (optional)',
  'rules.openExclusion': '+ Add individual exclusion',
  'common.close': 'Close',
  'prob.badge': 'Advanced',
  'summary.title': 'Review before drawing',
  'summary.redoTitle': 'Run the draw again',
  'summary.confirm': 'Draw',
  'summary.redoConfirm': 'Draw again',
  'summary.back': 'Back',
  'summary.participants': 'Participants',
  'summary.rules': 'Rules',
  'summary.combinations': 'Possible combinations',
  'summary.event': 'Event details',
  'summary.noEvent': 'No details (optional)',
  'summary.addEvent': 'Add details',
  'summary.editEvent': 'Edit',
  'summary.countPending': 'Calculating…',
  'summary.countLarge': ({ limit }) => `Many (more than ${limit} people)`,
  'summary.namesMore': ({ names, count }) => `${names} and ${count} more`,
  'summary.redoWarning': ({ code }) => `Links already sent${code ? ` (code #${code})` : ''} will still open with the previous result: send the new ones and tell the group the new code.`,
  'bar.label': 'Next step',
  'bar.needPeople': ({ count, min }) => (count ? `${count} of at least ${min} people` : `Add at least ${min} people`),
  'bar.addPeople': 'Add people',
  'bar.blocked': 'No valid combination',
  'bar.seeWhy': 'See why',
  'bar.stale': 'You made changes after the draw',
  'bar.redo': 'Draw again',
  'bar.done': ({ code }) => `Draw ${code} done`,
  'bar.send': 'Send results',
  'bar.ready': ({ count }) => `${count} people ready`,
  'bar.readyCount': ({ count, combos }) => `${count} people · ${combos} combinations`,
  'bar.draw': 'Draw',
};
