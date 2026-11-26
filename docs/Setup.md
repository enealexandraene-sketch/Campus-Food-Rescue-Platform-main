# Setup

How to set up the Campus Food Rescue Platform on your computer.

## What you need

| Tool | Version | Why |
|---|---|---|
| [Node.js](https://nodejs.org) | **24 (LTS)** | Runs our JavaScript code outside the browser |
| npm | comes with Node | Downloads libraries and runs the project's commands |

Everyone must use the **same major version of Node (24)**.

## 1. Install Node.js

- **macOS:** `brew install node@24` (with [Homebrew](https://brew.sh)), or download the **LTS** installer from [nodejs.org](https://nodejs.org).
- **Windows:** download the **LTS** installer from [nodejs.org](https://nodejs.org) and keep the default options.

Close and reopen your terminal, then check the installation:

```bash
node -v   # should print v24.x.x
npm -v    # should print a version number
```

All npm commands must be run **inside the `app/` folder**, because that's where `package.json` is.

## 2. Install the dependencies

```bash
cd app
npm install
```

This reads `package.json` and `package-lock.json` and downloads the libraries into `node_modules/`.

- Run it again whenever someone changes `package.json` (for example, after a `git pull` that adds a library).
- `node_modules/` is ignored by Git. Never commit it.

## 3. Check that everything works

```bash
npm test
```

All tests should pass. If they do, your setup is complete.

## Commands

Run these from the `app/` folder.

| Command | What it does |
|---|---|
| `npm install` | Downloads the dependencies |
| `npm test` | Runs all tests in `tests/` |
| `npm run dev` | Starts the server and restarts it every time you save a file |
| `npm start` | Starts the server without auto-restart |

> **Note:** `npm run dev` and `npm start` only work once the Express server (`src/server.js`) has been added. Until then, use `npm test`.

When the server runs, open <http://localhost:3000> in your browser. Stop the server with **Ctrl + C**.

## Project structure

```
app/
├── package.json        Project info, dependencies and commands
├── package-lock.json   Exact library versions (commit this file)
├── .gitignore          Files Git must ignore (node_modules, .env)
├── src/
│   └── domain/         Classes from the class diagram (Account, Provider, …)
├── public/             CSS, images and other static files
└── tests/              Automated tests (*.test.js)
```

## Adding a library

```bash
npm install <package-name>
```

This updates `package.json` and `package-lock.json`. Commit **both files**, and tell the team to run `npm install` after pulling.

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `command not found: node` | Node isn't installed, or the terminal was opened before installing it | Install Node, then reopen the terminal |
| `npm error enoent Could not read package.json` | You're not in the `app/` folder | `cd app` |
| `Cannot use import statement outside a module` | `"type": "module"` is missing from `package.json` | Add it back |
| `Cannot find module '...'` | Dependencies aren't installed, or an import path is wrong | Run `npm install`, and check that the path ends in `.js` |
| `EADDRINUSE: address already in use :::3000` | The server is already running in another terminal | Stop it with Ctrl + C, or close the other terminal |

## Learning resources

- [MDN – Express web framework (Node.js)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs): a beginner-friendly tutorial covering our stack
- [Node.js – Introduction](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [Node.js test runner](https://nodejs.org/api/test.html): how our tests are written
