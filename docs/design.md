# Design direction

Three directions were considered. The second was built.

## The three directions

### 1. Working drawings

The site as an architecture document: every section a labelled sheet, projects as exploded layer diagrams, a fine grid behind everything.

- Strength: speaks directly to the engineering depth.
- Weakness: cold. Blueprint grids and monospace labels are also what most developer portfolios already look like.

### 2. Two directions (chosen)

The site is built on the fact that Yaman works in two scripts. His name appears in Latin and in Arabic at opposite ends of one line. Switching language turns the page over. Projects are told through diagrams of their hardest problems.

- Strength: the design itself demonstrates his niche, right-to-left and Arabic-first work, before a word is read. It needs no screenshots, which matters because only verified material may be shown.
- Weakness: two full languages mean every layout must be checked twice.

### 3. App in hand

A phone frame stays fixed in the middle of the screen while the page scrolls, and each project plays inside it.

- Strength: immediately says "mobile developer".
- Weakness: depends entirely on real screenshots and recordings, which are not available for most projects. Fabricating them is not an option.

## Why direction 2

It is the only one that is specific to this person. Many developers can show a phone frame or a grid. Few can show a site that reads correctly from both sides.

## Palette

Damascus is called the city of jasmine. It is ringed by the Ghouta orchards and known for its apricots. Those three things give the paper, the green and the accent.

| Token | HEX | Use |
|---|---|---|
| Ghouta | `#0C3A34` | Hero, expertise, contact, header |
| Ghouta deep | `#072824` | Scrolled header, transition backdrop |
| Ghouta soft | `#14493F` | Raised surfaces on green |
| Jasmine | `#F6F7F1` | Paper sections, text on green |
| Jasmine dim | `#E9EDE4` | Alternate paper sections |
| Ink | `#11211E` | Text on paper |
| Ink soft | `#4C5F59` | Secondary text on paper |
| Sage | `#A9C7BD` | Secondary text on green |
| Apricot | `#FFB24D` | Accent: markers, primary button, second name |
| Apricot deep | `#9A5200` | Accent text on paper |
| Leaf | `#6FD3A8` / `#0F5A4E` | "Live" and "synced" states |
| Pomegranate | `#FF8A8E` / `#B8323A` | "Offline" and "rejected" states |

Every text pairing meets WCAG AA. The lowest is apricot deep on jasmine dim at 4.9:1.

There is no blue. The site is single-theme by choice: the green and paper blocks are the identity, and a dark mode would flatten them.

## Typography

| Role | Latin | Arabic |
|---|---|---|
| Display | Bricolage Grotesque (variable, optical size) | Fustat (variable, Kufic) |
| Body | IBM Plex Sans (variable) | IBM Plex Sans Arabic |

Kufic headings over Naskh-style body text is the classic Arabic pairing. Bricolage brings character to the Latin headings, and Plex keeps long text calm in both scripts. Arabic text gets more line height and no letter-spacing, because its letters join.

## Signature details

- **The lockup.** Two names, two directions, one line. On the English page the Latin name leads from the left and the Arabic name answers from the right. On the Arabic page they swap.
- **The nuqta.** The rhombic dot of Arabic calligraphy is the site's only marker: bullets, timeline nodes, status indicators, the packet in diagrams, the favicon.
- **The arch.** The portrait sits in an arch, after the doorways of old Damascus houses.
- **Diagrams as imagery.** Each case study shows its hardest problems as flow diagrams, and two of them as small working models.

## Page structure

Home: Hero → About → Selected work → Expertise → Experience → Recognition → Notes → Contact.

Case study: title and facts → the problem → my part → the hard parts (diagrams and demos) → architecture and stack → where it stands → next project.

Experience and achievements stay separate: the timeline shows the work in order, and Recognition holds the award, the live app and the training.

## Motion

| Moment | What happens | Why |
|---|---|---|
| Page load | Each name is written in its own direction, the line draws, a nuqta starts travelling between them | The one orchestrated moment. It states the idea. |
| Language switch | The page turns over on its vertical axis | Shows the mirror, not just a reload |
| Page change | Cross-fade, and the project name moves from the list into the case study title | Keeps your place |
| Project rows | Green sweeps in from where reading starts, the name shifts | Answers the pointer |
| Diagrams | Steps arrive in order, then packets travel the chain | Shows direction of flow |
| Timeline | The line grows as it scrolls into view | Shows sequence |
| Buttons | "Copy" becomes "Copied", status dots pulse only when live | Confirms an action or a state |

Only `transform`, `opacity`, `clip-path` and `translate` are animated. With reduced motion turned on, every animation and page transition is switched off and all content is visible at once.

## Responsive behaviour

- Fluid type and spacing through `clamp()`, with no fixed breakpoints for sizes.
- Under 60rem, two-column sections stack. Project rows become stacked blocks.
- Under 48rem, diagrams turn vertical and packets travel downward. The header keeps the name and the language switch.
- The hero name scales with the viewport and always fits on one line.
- No page scrolls sideways at 375px, in either language.
