# Ipon Challenge — App Showcase: Image-Generation Prompt

Paste the block below into an image model (Midjourney, DALL·E, Imagen, Firefly, etc.).
Everything is locked to the **real app brand** pulled from the codebase, so the result
stays on-brand instead of looking like a generic finance app.

> **Tip:** Midjourney users — append `--ar 16:9 --style raw --q 2` (or `--ar 3:2` for a portfolio tile).
> Generators ignore exact hex codes but respect the *named* colors + mood, so both are included.

---

## THE PROMPT

A premium, ultra–high-resolution product showcase for **"Ipon Challenge"**, a student
personal-finance mobile app from the Philippines (currency is the peso, ₱). Dribbble /
Behance / App-Store launch quality — a real product advertisement, not a template.

**Composition:** Three realistic, high-detail smartphone mockups floating in a clean,
spacious hero composition with soft depth, realistic shadows and gentle studio lighting.
Center phone raised and facing forward; the two side phones slightly lower, angled inward
(~5°). Floating glassmorphism info-chips drift around the phones. Generous negative space.
A short bold headline sits top-left: **"Budget smarter, spend wiser."**

**Brand color palette (use exactly, consistently across ALL screens):**
- Deep navy-indigo primary: `#35408e` → `#232a57` → `#161a38` (the "NU Blue")
- Mid indigo: `#4d5db4`
- Warm gold accent: `#ffc91a` → `#f5b300` (the "NU Gold"), used for highlights, CTAs, progress
- Light backgrounds: near-white `#f7f8fc`, surfaces pure white `#ffffff`
- Status colors: emerald `#22c55e` (good), amber `#f59e0b` (caution)
- Hero backdrop: dark navy `#0b0e20` with a subtle mesh gradient — soft indigo and gold
  radial glows in the corners, faint grid texture.

**Design language:** modern glassmorphism, large 2rem rounded corners, soft layered
shadows, elegant typography (geometric sans like *Plus Jakarta Sans* for headings, *Inter*
for body), crisp iconography, lots of breathing room. Premium fintech startup aesthetic.
A small brand mark: a rounded-square navy badge containing a gold coin with a peso "₱" and
a graduation cap.

**The three phone screens (must read clearly):**

1. **AI Coach (chat) — the hero feature.** A messaging interface titled **"Ipon Coach –
   Your AI money buddy"** with a navy gradient header. A friendly cartoon/flat-illustration
   avatar of the AI assistant. **Show that the coach has two selectable variants — a female
   assistant and a male assistant — displayed as two small avatar choices in the header**
   (warm, intelligent, approachable flat-illustrated faces; the female with longer hair and
   gold earrings, the male with short hair and a navy shirt). Chat bubbles: a user asking
   *"Can I afford ₱1,000?"* in a navy-gold bubble, and the AI replying with budgeting advice
   plus a small **Confirm / Cancel** action card and a green *"✓ Saved to your account"* note.
   A glowing gold sparkle badge marks it as AI.

2. **Dashboard (finance overview).** A large navy-gradient **balance card** reading
   **"Remaining balance ₱8,450"** with a wallet icon, a gold progress bar ("Spent ₱3,050 of
   ₱11,500"), and two tiles: *"Safe to spend / day ₱422"* and *"Days left 20."* Below it an
   **"Allowance Runway"** card with an emerald *"On track"* badge, a "20 days" figure, a
   4-week mini bar chart, and a 💡 smart-tip line. A clean bottom tab bar with a gold "+" FAB.

3. **Savings Goals.** Header **"Savings Goals — Turn your dreams into milestones."** Summary
   stat tiles (Available to save, Total saved, Total target, Completed 1/3). Goal cards each
   with a circular **gold progress ring** — e.g. *"New Laptop — 68% — ₱13,600 of ₱20,000"*
   and *"Barkada Trip — 40%"* — and a gold **"Add Money"** button.

**Overall mood:** intelligent, friendly, student-focused, trustworthy, polished. The app
helps students **manage money, track allowance, control spending, monitor expenses, save
through goals, and survive their semester budget.** Make it feel like a unique AI financial
assistant — clean, premium, and launch-ready.

**Quality:** photorealistic device mockups, ultra-sharp UI, 8k, crisp text, accurate color,
professional lighting, subtle reflections. No clutter, no lorem-ipsus gibberish text, no
watermark, no distorted hands or faces.

---

### Negative prompt (for models that support one)
`low-res, blurry text, gibberish UI text, cluttered layout, generic blue corporate template,
clashing colors, distorted phone shape, melted faces, watermark, logo of other brands,
stock-photo people, cheap drop shadows, skeuomorphic 2010 style`

---

### Notes for whoever runs this
- The **female coach is the app's default** avatar; show her as the active/selected one and
  the male as the alternate choice.
- Keep **every screen in the same palette** — don't let the generator drift to teal/green
  fintech defaults. If it does, add "strictly navy-indigo and gold only" and re-roll.
- For a portfolio tile, prompt one screen at a time (e.g. just the AI Coach phone) at higher
  fidelity, then composite.
- A pixel-exact, real version of this same layout already exists as code in
  `showcase/showcase.html` — open it in Chrome and screenshot for a guaranteed on-brand asset.
