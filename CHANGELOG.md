# v2.0.0 Change of Stylus

- Changed Stylus variables `ht-brown` and `ht-pink` into `ht-background` and `ht-border` respectively

# v1.5.0 Boarding Pass

- Remove `data-hint-before` in favor of reusing `data-hint` and the `hint-before` class
- Remove `opacity` transitions in favor of `display: none` and `display: block`, fixing a content `overflow` bug
- Introduced a JavaScript enhancement that allows hints to be constrained to the visible viewport
- Moved `opacity` transition animation to JavaScript for better progressive enhancement

# v1.3.1 Boring Panda

- No delays on hide

# v1.3.0 Obnoxious Boar

- Introduced a `1s` delay before popping up hints

# v1.2.2 Before Dawn

- Introduce ability to add `:before` hints using `aria-label`

# v1.2.1 Hot Pink

- Changed prefix of color variables

# v1.2.0 101 Dalmatians

- Using `top: 101%` is better most of the time

# v1.1.15 Nudity Is Bad

- Include `nib` during stand-alone builds for cross-browser compatibility

# v1.1.0 Accessible King

- `aria-label` attributes also displayed as hints
- Slight change to make responsiveness better around breakpoint

# v1.0.2 Take a Hint

- Initial Public Release
