## Sibyl

[![Build status](https://travis-ci.org/stencila/sibyl.svg?branch=master)](https://travis-ci.org/stencila/sibyl)
[![Code coverage](https://codecov.io/gh/stencila/sibyl/branch/master/graph/badge.svg)](https://codecov.io/gh/stencila/sibyl)
[![Chat](https://badges.gitter.im/stencila/stencila.svg)](https://gitter.im/stencila/stencila)

### Use

Sibyl is a tool for [building](#building-containers), inspecting and running containers for authoring and reproducing [Stencila](https://stenci.la) documents.

#### Building containers

##### Standard containers

Sibyl's *standard* container images are intended to be comprehesive environments for scientific computing. They aim to provide a computing environment that meets the needs of 95% of Stencila documents. We intend to build and publish daily versions of these images. Currently there is only one *stream* of standard images: `alpha`. The [`images`](images) folder contains Dockerfiles that define how each stream is built.

##### Custom containers

In addition to standard containers, `sibyl build` allows for the easy creating of custom containers. One use case for custom containers is where the author wishes to specify how the container is to be build by provding one or more of:

- `Dockerfile`
- `requirements.txt` for specifying a Python version and/or package versions
- `r-requires.txt` for specifying a R version and/or package versions
- `package.json` for specifying a Node.js version and/or package versions

The other use case for custom containers is where users want a container that is as close as possible to their local environment. The Stencila packages for R, Python and Node.js provide a `relect` function which provides a description of the language runtime and the installed package versions. For example, in R, the command `stencila:::reflect()` produces a JSON like this:

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
