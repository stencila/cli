# ⌨️ CLI 

**Stencila on the command line**

## ⚠️ Deprecated

This project is deprecated and no longer maintained. Please see, our main repository, [`stencila/stencila`](https://github.com/stencila/stencila), for other projects that provide similar or alternative functionality.

## 📦 Install

The installation requires two steps:
1. Download and unpack the binary file with the [CLI for your operating system](https://github.com/stencila/cli/releases).
2. Copy the binary file to the relevant location in your operating system so that you can easily access the tool in the command line:
  * on Windows, create a folder in `C:/ProgramFiles/stencila` and copy the `stencila.exe` file into it; then open Windows Command Line and add the folder to the `PATH`: `setx PATH "$env:path;C:/ProgramFiles/stencila"`
  * on Linux, copy the `stencila` binary file to `/usr/local/bin/`;
  * on Mac OS X, copy the `stencila` file to the `/Applications` folder.


## ⚡ Use

Get a list of available commands...

```bash
stencila help
```

Get help on a specific command e.g.

```bash
stencila help convert
```

## ⚒️ Develop

```bash
npm install
npm run lint
npm test
npm run build
```

Or, if you prefer `make`:

```bash
make setup lint test build
```

The binaries `stencila-cli-linux`, `stencila-cli-macos` and `stencila-cli-win.exe` in the `build` directory. You can test them out there e.g.

```bash
./build/stencila-cli-linux convert test/fixtures/hello-world.md test/outputs/hello-world.html
```

The Travis CI build will upload binaries to the releases page. So, if there is no lint and all tests pass, make a release by pushing a tag:

```bash
git tag v0.29.0
git push && git push --tags
npm run release
```
