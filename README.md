# GOX Demo

An interactive showcase of GOX: HTTP handlers, Actions, five client frameworks,
WebSocket chat and channels, file transfers, dynamic routes, and a small demo store.

## Quick start

Create the demo with GOX:

```sh
gox createproject --demo
```

Or specify a project name:

```sh
gox createproject my-demo --demo
```

Then run this command from the created project directory:

```sh
gox run
```

Open http://localhost:3000.

GOX handles the entire setup. You do not need to clone this repository, add
frameworks manually, or copy any files.

## How GOX prepares the demo

Internally, `--demo` performs these steps in order:

1. Creates the normal project scaffold with the chosen project name.
2. Sets up React, Preact, Solid, Vue, and Svelte using the same process as
   `gox client add react preact solid vue svelte`.
3. Downloads this repository from GitHub.
4. Copies the demo files into the project, preserving their directory structure
   and overwriting matching scaffold files.

The generated framework setup, dependency manifests, Go module files, and
project configuration remain in place. The demo adds its own routes and
WebSocket configuration without replacing the chosen project name.

## Repository layout

This repository contains only the demo source files and assets. Generated
manifests, installed dependencies, and build output are created by GOX.

```text
app/                  Demo routes and enabled WebSocket configuration
pages/                Pages, shared components, and the custom error page
client/<framework>/playground/
                      React, Preact, Solid, Vue, and Svelte components
public/               Scripts, styles, and the GOX logo
websocket/            Global socket and chat channel handlers
tests/                Demo index smoke test
```

The demo needs no additional third-party dependencies beyond GOX and the five
frameworks. Run `gox test` from the generated project to execute the smoke test.

## Demo behavior

- HTML and code examples are rendered on the server; JavaScript adds interaction.
- Chat messages are not persisted. Poll totals live in server memory.
- File transfers return the uploaded file without permanent server storage.
- Store reviews and cart contents are saved only in the current browser.
- Checkout is simulated: no payments are taken and no products are shipped.
- `/products/missing-product` demonstrates a missing product; `/missing-page`
  demonstrates the global 404 page.

The demo uses GOX client hydration, Actions, Channels, and WebSocket component
responses. Its release must be paired with a GOX version supporting these features.
