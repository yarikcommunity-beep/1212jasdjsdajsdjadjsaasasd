# d@rkmoon Landing Testing

Use this skill when testing the d@rkmoon animated landing page in `project/`.

## Devin Secrets Needed

- None. The deployed/static preview is public and does not require login.

## Environments

- Public preview used in this project: `https://out-dobqilna.devinapps.com`
- Local project directory: `project/`
- Useful local commands:
  - `npm ci --prefix project`
  - `npm run lint --prefix project`
  - `npm run typecheck --prefix project`
  - `npm run build --prefix project`
  - `npm run dev --prefix project` for local UI testing
  - `npm run preview --prefix project` after building static export

## Primary Runtime Flow

1. Open the preview or local homepage.
2. Verify the hero text shows `d@rkmoon / anonymous gravity interface`, `Black silence.`, `White gravity.`, and `Hidden identity.`
3. Observe the React Three Fiber black hole at the hero for several seconds.
   - It should show a soft black event horizon with white accretion/lensing glow and particle texture.
   - It should not show a visible square Canvas border or harsh wireframe sphere around the black hole.
4. Scroll down to the exploded section rather than relying only on clicking the hero CTA; the CTA can be clipped in small recording viewports.
5. Verify the lines `no profile`, `no face`, `no signal`, and `only gravity` become visible.
6. While scrolling through the exploded section, verify the black-hole model enlarges/shifts and particles spread outward while continuing to orbit.
7. Continue to the feature cards and verify `Anonymous shell`, `Frame by frame`, and `Exploded black hole` are visible with no Next.js/runtime overlay.
8. Check the browser console after the flow; it should not show runtime errors.

## Recording Tips

- Use a browser/desktop recording for UI proof because the main value is visual animation.
- Maximize or set Chrome to a predictable viewport before recording.
- If the initial frame appears blurred due page load/animation, wait a few seconds before beginning assertions.
- Annotate: hero/model check, exploded scroll check, and feature-card reachability.
