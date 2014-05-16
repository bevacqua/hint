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

Just call `hint.all` on an HTML DOM node. It'll find any nodes with a `data-hint` attribute and work its magic!

```js
hint.all(document.body);
```

You can also do it on just one element.

```js
hint(elem);
```

Turn them off using `hint.off`.

```js
hint.off(elem);
```

You'll get a nice little tooltip. Remember to include the CSS in your styles!

![hint.png][1]

If you want to make the tooltip right-aligned, use the `ht-hint-right` class instead.

# License

MIT

  [1]: http://i.imgur.com/ZWpAHu1.png
