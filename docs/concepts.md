## Bundles

Things to describe

- address
- name
- version

Stages:

- `fetch`: fetch a bundle from some remote or local location
- `check`: `fetch` + check that the necessary files are in the bundle
- `compile`: `check` + compile a Dockerfile based on the contents of the bundle
- `build`: `compile` + build a Docker image from the Dockerfile
- `launch`: `build` + start a container from the image


## Schemes

The _scheme_ is the part of the bundle address which lets Sibyl know where, and how, to fetch a bundle.

- [bitbucket://](bitbucket)
- [dat://](dat)
- [dropbox://](dropbox)
- [file://](file)
- [github://](github)
- [gitlab://](gitlab)
- [http://](http)


## Images

During the _build_ stage, Sibyl creates a _bundle image_ for the bundle. A bundle image is a Docker container image.

The base images have Stencila packages for [Node.js](https://github.com/stencila/node), [Python](https://github.com/stencila/python) and [R](https://github.com/stencila/r) as well as a large number of system libraries and packages for scientific computing. They aim to provide a computing environment that meets the needs of 95% of Stencila documents. We intend to build and publish daily versions of these base images. The [`images`](images) folder contains Dockerfiles that define how each image is built. 

Currently there are two base images:

- [alpha](alpha): a comprehensive image for data analysis in Python, R and/or Node.js
- [iota](iota): a minimal image for Sibyl development and testing

In the future, we may add more base images focussing on specific use cases (e.g. genomics)

## Languages

You can customize a bundle container by specifying one or more requirements files in your bundle:

- [Node.js](node)
- [Python](python)
- [R](r)


## Hooks

Hooks 

- [github](github-hook)
- [gitlab](gitlab-hook)
- [bitbucket](bitbucket-hook)

