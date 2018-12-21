# Http Component Loader

load html/js/css lazy for component on browser (eg. [Vue.js](https://www.vuejs.org))

## Usage

```js
new HttpComponentLoader({css, js, html}).loadComponent();

// static methods:
HttpComponentLoader.loadCss(cssUrl);
HttpComponentLoader.loadJs(jsUrl);
HttpComponentLoader.loadText(textUrl);
```
