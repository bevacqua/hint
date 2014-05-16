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

If you want to use the `:before` pseudo-selector, use the `data-hint-before` attribute instead. The hint has a `z-index` of `5000`.

# License

MIT

  [1]: http://i.imgur.com/EFP5j4E.png
