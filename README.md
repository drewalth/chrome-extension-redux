# chrome-extension-zustand

![Ditto Info Extension](./docs/assets/hero.png)

A proof-of-concept for using [Zustand](https://zustand.docs.pmnd.rs/) and
the [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/) as a single source of truth
in [Chrome Extensions](https://developer.chrome.com/docs/extensions/).

This demo extension fetches data from [pokeapi.co](https://pokeapi.co/) and displays it in a popup.

## Getting Started

Clone the repository:

```bash
gh repo clone drewalth/chrome-extension-zustand
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Load the extension in Chrome:

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" if it is not already enabled.
3. Click on "Load unpacked" and select the `dist` directory of this repository. For convenience, you can pin the extension to your toolbar.
4. The extension should now be loaded and ready to use.

#### Built with

- [Vite](https://vitejs.dev/)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) ⭐
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Immer](https://immerjs.github.io/immer/)
