# Kestrel Motor Co. — design brief

- **Domain:** certified pre-owned car dealership (fictional), Toronto.
- **Users:** first-time and returning buyers who think in monthly payments, not sticker prices.
- **Main interaction:** a monthly-budget slider drives the entire lot; term and down payment recompute every payment live. Detail view adds a full finance calculator, compare tray and test-drive booking.
- **References studied:** online-first used-car retailers (filter-first inventory, transparent pricing), EV maker configurators (spec grids, single hero object), editorial automotive microsites (condensed display type, large numerals).
- **Layout:** dark petrol hero with a budget console beside a staged car; bone-coloured inventory board with a sticky filter bar and spec-sheet cards; a three-column promises band.
- **Palette:** petrol `#08191b` / `#0e2a2d`, bone `#ece9df`, paper `#f7f5ee`, volt `#d5f04c`, ink `#0c1415`, steel `#8da0a0`.
- **Type:** Big Shoulders Display (headlines, numerals), Instrument Sans (body), JetBrains Mono (specs and stock numbers); all self-hosted.
- **Motion:** car roll-in on budget change, card lift and wheel-side drift on hover; everything off under `prefers-reduced-motion`.
- **Imagery:** original vector vehicle illustrations generated in code, tinted per paint colour; no real marques or logos.
- **Accessibility:** skip link, labelled controls, live regions for result counts, visible focus, 44px-class targets, no horizontal overflow at 390px.
