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

Just call `hint` on your `[data-hint]` objects.

```js
var elem = document.querySelector('[data-hint]');
hint(elem);
```

You'll get a nice little tooltip. Remember to include the CSS in your styles!

![hint.png][1]

If you want to make the tooltip right-aligned, use the `ht-hint-right` class instead.

# License

MIT

  [1]: http://i.imgur.com/ZWpAHu1.png
