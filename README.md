# hint

> Awesome tooltips at your fingertips

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

By default, the `:after` pseudo-selector is used. This means you can use the `:before` pseudo-selector for your own purposes. If you need to switch things up, use the `data-hint-before` attribute instead.

```html
<span data-hint-before='foobar'>Foo Bar</span>
```

You can also use the [`aria-label`][2] attribute.

```html
<span aria-label='foobar'>Foo Bar</span>
```

Hints have a `z-index` of `5000`.

# License

MIT

  [1]: http://i.imgur.com/EFP5j4E.png
  [2]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
