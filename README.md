## Sibyl

[![Build status](https://travis-ci.org/stencila/sibyl.svg?branch=master)](https://travis-ci.org/stencila/sibyl)
[![Code coverage](https://codecov.io/gh/stencila/sibyl/branch/master/graph/badge.svg)](https://codecov.io/gh/stencila/sibyl)
[![Chat](https://badges.gitter.im/stencila/stencila.svg)](https://gitter.im/stencila/stencila)

> *ˈsɪbɪl* _noun_
> 1. in ancient Greece a woman believed to be an oracle incapable of speaking mistruths
> 2. a tool for building and running containers for authoring and reproducing [Stencila](https://stenci.la) documents

### Install

Install the Node.js [package](https://www.npmjs.com/package/stencila-sibyl):

```sh
npm install stencila-sibyl
```

Alternatively, if you only want to use the Bash [script](https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh), download it to somewhere on your `$PATH` and make it executable e.g. on Linux:

```sh
curl https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh > ~/.local/bin/sibyl
chmod 755 ~/.local/bin/sibyl
```

The Sibyl Bash script requires [`curl`](https://curl.haxx.se/), [`docker`](https://docs.docker.com/engine/installation/) and [`jq`](https://stedolan.github.io/jq/). The Sibyl Node.js server requires `node` v7.6.0 or higher.

### Use

Sibyl builds and runs execution environments for reprodubile document bundles. A *bundle* is a collection of one or more files that contain the source of the document, and optionally, supporting data, code and specifications of dependencies.

Sibyl performs several key tasks with bundles:

- `fetch` : fetches a bundle from some remote or local location
- `build` : builds a Docker container image based on the contents of the bundle
- `check` : checks that the container image has the environment specified
- `start` : starts a container from the image with a running Stencila host
- `launch`: does all of the above tasks

These tasks are implemented in [`sibyl.sh`](sibyl.sh) and can be run at the command line: e.g `sibyl launch github://stencila/test`

The [`server`](server/server.js) provides a web interface to `sibyl launch`. Start it with `npm start` and then open browser at [`http://localhost:3000`](http://localhost:3000). When you provide the server with a bundle address (e.g. `github://stencila/test`) it will launch a container based on that bundle, echoing progress to the browser. Then, once the container has been built and started, the browser is redirected to the bundle's "main" document running inside the container.

##### Standard containers

Sibyl's *standard* container images are intended to be comprehesive environments for scientific computing. They aim to provide a computing environment that meets the needs of 95% of Stencila documents. We intend to build and publish daily versions of these images. The [`images`](images) folder contains Dockerfiles that define how each stream is built. Currently there is only one *stream* of standard images: `alpha`.

##### Custom containers

In addition to standard containers, `sibyl build` allows for the easy creating of custom containers. One use case for custom containers is where the author wishes to specify how the container is to be build by provding one or more of:

- `Dockerfile`
- `requirements.txt` for specifying a Python version and/or package versions
- `r-requires.txt` for specifying a R version and/or package versions
- `package.json` for specifying a Node.js version and/or package versions

The other use case for custom containers is where users want a container that is as close as possible to their local environment. The Stencila packages for R, Python and Node.js provide a `environ` function which produce a description of the language runtime and the installed package versions. For example, in R, the command `stencila:::envrion()` produces a JSON like this:

```json
{
  "version": "3.3.2",
  "codename": "Sincere Pumpkin Patch",
  "date": "2016-10-31",
  "platform": "x86_64-pc-linux-gnu",
  "packages": {
    "actuar": "2.0-0",
    "assertthat": "0.1",
    "babynames": "0.2.1",
    "backports": "1.0.5",
    "base": "3.3.2",
    "base64enc": "0.1-3",
    "BH": "1.62.0-1",
    "bitops": "1.0-6",
...
```

When you author a document on your local machine, Stencila records this information, so that a container as close a possible to your authoring environment is reproduced.
