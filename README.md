## Sibyl

[![Build status](https://travis-ci.org/stencila/sibyl.svg?branch=master)](https://travis-ci.org/stencila/sibyl)
[![Code coverage](https://codecov.io/gh/stencila/sibyl/branch/master/graph/badge.svg)](https://codecov.io/gh/stencila/sibyl)
[![Chat](https://badges.gitter.im/stencila/stencila.svg)](https://gitter.im/stencila/stencila)

> *ˈsɪbɪl* _noun_
> 1. in ancient Greece a woman believed to be an oracle incapable of speaking mistruths
> 2. a tool for building and running containers for reproducible documents

### Why?

Stencila is available for the [desktop](https://github.com/stencila/desktop) but what if you want to publish a document without your readers having to install any software? What if you want to collaborate on a reproducible document using exactly the same versions of packages for R, Python or Node.js?

Sibyl builds and runs execution environments for reproducible document bundles. A *bundle* is a collection of one or more files that contain the source of the document, supporting data and/or specifications of dependencies. Sibyl fetches a bundle, builds a container for it and opens the document.

Sibyl is an evolution of [previous](https://github.com/stencila/stencila/tree/jurassic/docker) [approaches](https://github.com/stencila/hub/tree/077dc00044f010b6d4150e6e0e18823815307e13/worker) to containerizing Stencila documents. It is inspired by the elegance of [Binder](https://github.com/binder-project/binder) and takes advantage of our new decoupled architecture to allow reproducible environments for documents written in various formats (e.g. HTML, RMarkdown, Jupyter notebooks) using various (and possibly multiple) languages (i.e. R, Python, Node.js).

### Install

Install the Node.js [package](https://www.npmjs.com/package/stencila-sibyl):

```sh
npm install stencila-sibyl
```

The Sibyl Node.js server requires `node` v7.6.0 or higher.

Alternatively, if you only want to use the Bash [script](https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh), download it to somewhere on your `$PATH` and make it executable e.g. on Linux:

```sh
curl https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh > ~/.local/bin/sibyl
chmod 755 ~/.local/bin/sibyl
```

The Sibyl Bash script requires [`curl`](https://curl.haxx.se/), [`docker`](https://docs.docker.com/engine/installation/) and [`jq`](https://stedolan.github.io/jq/) and `netstat`.

Or, instead of installing everything, you can just run the Docker image:

```sh
docker run --publish 3000:3000 stencila/sibyl
```

[Actually, right now the `stencila/sibyl` image is not completely functional because it's attempting to use Docker-in-Docker (which needs some configuring,...or avoiding)]

### Use

Sibyl performs several key tasks with bundles:

- `fetch` : fetches a bundle from some remote or local location
- `compile` : compiles a Dockerfile based on the contents of the bundle
- `build` : builds a Docker container image from the Dockerfile for the bundle
- `check` : checks that the container image has the environment specified
- `launch` : starts a container from the image with a running Stencila host

These tasks are implemented in [`sibyl.sh`](sibyl.sh) and can be run at the command line: e.g `sibyl launch github://stencila/test`

The [`server`](server/server.js) provides a web interface to `sibyl launch`. Start it with `npm start` and then open browser at [`http://localhost:3000`](http://localhost:3000). When you provide the server with a bundle address (e.g. `http://localhost:3000/github://stencila/test`) it will launch a container based on that bundle, echoing progress to the browser. Then, once the container has been built and started, the browser is redirected to the bundle's "main" document running inside the container.

### Containers

Sibyl creates a Docker container image for each document bundle. All bundle container images are based on one of Sibyl's base container images. 

#### Base containers

The base images images have Stencila packages for [Node.js](https://github.com/stencila/node), [Python](https://github.com/stencila/python) and [R](https://github.com/stencila/r) as well as a large number of system libraries and packages for scientific computing. They aim to provide a computing environment that meets the needs of 95% of Stencila documents. We intend to build and publish daily versions of these base images. The [`images`](images) folder contains Dockerfiles that define how each image is built. 

Currently there is only one *stream* of base images: `alpha`. In the future, we may add more base images focussing on specific use cases (e.g. genomics)

#### Bundle containers

You can customize a bundle container by specifying one or more requirements files in your bundle:

- `requirements.txt` for specifying a Python version and/or package versions
- `r-requires.txt` for specifying a R version and/or package versions
- `package.json` for specifying a Node.js version and/or package versions
- `Dockerfile`for completely customizing the container (but must use a Stencila image as a base e.g. `FROM stencila/alpha`)

The other use case for custom containers is where users want a container that is as close as possible to their local environment. It is not currently implemented, but we're planning on adding this "make a container like my local environment" functionality. The Stencila packages for R, Python and Node.js provide a `environ` function which produce a description of the language runtime and the installed package versions. For example, in R, the command `stencila:::envrion()` produces the JSON below which could be used to build a container with the right versions of R and R packages.

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

### Development

#### Minikube

During development, because the base image sizes can large it can be handy to [install Minikube](https://kubernetes.io/docs/getting-started-guides/minikube/), start it:

```sh
minikube start
```

Then use the Docker daemon inside the Minikube cluster by setting the `DOCKER_` environment variables:

```sh
eval $(minikube docker-env)
```

