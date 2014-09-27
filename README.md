# hint

> Awesome pure CSS tooltips at your fingertips

# Install

Using Bower

```shell
bower install -S hint
```

Using `npm`

```shell
npm install -S hint
```

# Usage

Just give your elements a nice tooltip in HTML. When hovered, the hint will appear.

```html
<span data-hint='foobar'>Foo Bar</span>
```

You'll get a nice little tooltip. Remember to include the CSS in your styles!

![hint.png][1]

By default, the `:after` pseudo-selector is used. This means you can use the `:before` pseudo-selector for your own purposes. If you want the `data-hint` to use `:before`, then you must use the `hint-before` class on the element as well.

```html
<span data-hint='foobar' class='hint-before'>Foo Bar</span>
```

You can also use the [`aria-label`][2] attribute.

```html
<span aria-label='foobar'>Foo Bar</span>
```

If you want the `aria-label` hint to use `:before`, then you must use the `hint-before` class on the element as well.

```html
<span aria-label='foobar' class='hint-before'>Foo Bar</span>
```

Hints have a `z-index` of `5000`.

# JavaScript

The CSS will only get us so far, and we must add a tiny bit of JavaScript if we want a little functionality. This is not critical to `hint`, and is therefore considered an optional feature. The JavaScript code enables the following features.

- Hints are docked to the visible viewport so that they aren't cut off when they're near the edge
- If hints are even wider than the viewport itself, then they are rendered in multi-line, setting the max width to the viewport width
- You can define a maximum width to avoid hard-to-read long hints in wide viewports
- When the JavaScript snippet is used, hints transition into view a second after the target element is hovered

To include the JavaScript, just use the following snippet if you're using CommonJS, or refer to the `dist` directory for the compiled distributions.

```js
require('hint');
```

To set the maximum hint width, do:

```js
require('hint').maximumWidth = 650;
```

You can also set it to 'auto', which means the full viewport size will be used if the tooltip exceeds the viewport size in length. In practice, `'auto'` means `Infinity` will be used. The default `maximumWidth` value is `650` pixels wide.

# License

MIT

  [1]: http://i.imgur.com/EFP5j4E.png
  [2]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
