# Testing Darkmoon Landing

Use this skill when testing the Next.js `d@rkmoon` landing page in `project/`.

## Devin Secrets Needed

No secrets are required for local UI testing of this landing page.

## Setup

1. Install dependencies from the repo root:
   ```bash
   npm ci --prefix project
   ```
2. Start the local dev server from the repo root:
   ```bash
   npm run dev --prefix project -- --hostname 0.0.0.0 --port 3000
   ```
3. Open `http://localhost:3000` in Chrome.

If `wmctrl` is unavailable for maximizing Chrome, `xdotool` may be available as a fallback:
```bash
xdotool getactivewindow getwindowgeometry
```

## Primary Runtime Flow

Record one focused browser flow:
1. Verify the hero shows `d@rkmoon / anonymous gravity interface`, `Black silence.`, `White gravity.`, `Hidden identity.`, and the CTAs `enter the void` / `exploded view`.
2. Click `enter the void` or scroll to the rift section and verify `transparent rift cube` plus the Russian R3F heading are visible.
3. Confirm the React Three Fiber glass/wireframe cube is visible and rotating, not a blank canvas.
4. Scroll into the exploded section and verify the black hole grows while text lines become readable: `no profile`, `no face`, `no signal`, `only gravity`.
5. Continue to the feature cards and final section; verify `Anonymous shell`, `Frame by frame`, `Exploded black hole`, and final `d@rkmoon` are reachable.

## Evidence

- Capture a screen recording with annotations for hero, rift cube, exploded text, feature cards, and final section.
- Include screenshots of the hero, cube section, exploded text, feature cards, and final `d@rkmoon` section in the test report.

## Useful Checks

From the repo root:
```bash
npm run lint --prefix project
npm run typecheck --prefix project
npm run build --prefix project
```

`npm ci` may report dependency audit findings; note them separately from UI runtime assertions unless the task is specifically about dependency security.
