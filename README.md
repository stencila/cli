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

There are different layers to Sibyl, having different levels of functionality and installation complexity.

#### `sibyl.sh` Bash script

At the heart of Sibyl is the [`sibyl.sh`](https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh) Bash script. You can use it to run most of Sibyls tasks on your local machine. Download it to somewhere on your `$PATH` and make it executable e.g. on Linux:

```sh
curl https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh > ~/.local/bin/sibyl
chmod 755 ~/.local/bin/sibyl
```

`sibyl.sh` requires [`curl`](https://curl.haxx.se/), [`docker`](https://docs.docker.com/engine/installation/), [`jq`](https://stedolan.github.io/jq/) and `netstat` to be installed.

Use `sibyl.sh` with a task name and bundle "address" e.g. 

```sh
sibyl launch github://stencila/test`
```

or, in an existing bundle directory

```
sibyl launch
```

Tasks:

- `fetch`: fetch a bundle from some remote or local location
- `compile`: `fetch` + compile a Dockerfile based on the contents of the bundle
- `build`: `compile` + build a Docker image from the Dockerfile
- `launch`: `build` + start a container from the image

Addresses:

- `file:/some/folder`: a bundle at `some/folder` on your filesystem
- `file:/some/archive.tar.gz`: a bundle in an archive on your filesystem
- `file:/some/archive.tar.gz/folder`: a bundle within `folder` in an archive on your filesystem
- `github:/user/repo`: a bundle in a repository on Github
- `github:/user/repo/folder`: a bundle within `folder` in a repository on Github


#### `stencila-sibyl` Node.js package

The Node.js [package](https://www.npmjs.com/package/stencila-sibyl) provides a web interface to `sibyl.sh`:

```sh
npm install stencila-sibyl
```

The server requires `node` v7.6.0 or higher as well as the dependencies of `sibyl.sh` (above). The `sibyl.sh` script is installed as part of the package so you don't need to install that separately.

Start the server with `npm start` and then open browser at [`http://localhost:3000`](http://localhost:3000). When you provide the server with a bundle address (e.g. `http://localhost:3000/github://stencila/test`) it will launch a container based on that bundle, echoing progress to the browser. Then, once the container has been built and started, the browser is redirected to the bundle's "main" document running inside the container.

#### `stencila/sibyl-server` Docker image

Instead of installing Sibyl locally, you can use the `stencila/sibyl-server` Docker image. The Docker daemon is not available in that image so you have to make your local daemon available to it:

```sh
# Run container bound to the local Docker daemon
docker run --detach --volume /var/run/docker.sock:/var/run/docker.sock --publish 3000:3000 stencila/sibyl-server
```

Or, if you want something that is closer to a Kubernetes deployment scenario with a Docker daemon running in it's own container, then:

```sh
# Create a network for the two containers to talk over
docker network create sibyl-net
# Run a Docker-in-Docker (`dind`) container
docker run --detach --net sibyl-net --name sibyl-docker --rm --privileged docker:dind
# Run a Sibyl server container with DOCKER_HOST pointing to the Docker daemon running in the `dind` container
docker run --detach --net sibyl-net --name sibyl-server --rm --env DOCKER_HOST=tcp://sibyl-docker:2375 --publish 3000:3000 stencila/sibyl-server
```

#### Minikube cluster

The [`deploy`](deploy) folder has configurations for deployment on a Kubernetes cluster. To try it out locally, install [`minikube`](https://kubernetes.io/docs/tasks/tools/install-minikube/) and [`kubectrl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/) and then:

```sh
# Start up Minikube cluster
minikube start
# Deploy Sibyl to the cluster
make deploy
```

It can take a few minutes to start up, but when the `Deployment` is available:

```sh
$kubectl get deployments
NAME               DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
sibyl-deployment   2         2         2            2           1h
```

You can get then get the `Service` URL: 

```sh
minikube service sibyl-service --url
```

And check that it can launch a container:

```sh
curl $(minikube service sibyl-service --url)/~launch/github://octocat/spoon-knife
```

The Minikube dashboard can be useful if you're getting started with Kubernetes: `minikube dashboard`. If you're developing the Sibyl Docker images and using Minikube it saves a lot of time if you use the Docker daemon inside the Minikube cluster: `eval $(minikube docker-env)`. You should be able to enable the `Ingress` using `minikube addons enable ingress` but it's not really necessary.


### Containers

Sibyl creates a Docker container image for each document bundle. All bundle container images are based on one of Sibyl's base container images. 

#### Base containers

The base images images have Stencila packages for [Node.js](https://github.com/stencila/node), [Python](https://github.com/stencila/python) and [R](https://github.com/stencila/r) as well as a large number of system libraries and packages for scientific computing. They aim to provide a computing environment that meets the needs of 95% of Stencila documents. We intend to build and publish daily versions of these base images. The [`images`](images) folder contains Dockerfiles that define how each image is built. 

Currently there are two base images:

- `alpha`: a comprehensive image for data analysis in Python, R and/or Node.js
- `iota`: a minimal image for Sibyl development and testing

In the future, we may add more base images focussing on specific use cases (e.g. genomics)

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