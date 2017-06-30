# Sibyl : a tool for building and running containers for reproducible documents

Stencila aims to be an "office suite" for reproducible research. With Stencila [Desktop](https://github.com/stencila/desktop) you can author documents on own computer. But what if you want to publish a document without your readers having to install any software? What if you want to collaborate on a reproducible document using exactly the same versions of packages for R, Python or Node.js? Or maybe you want to publish documents and allow you readers to interactively explore data driven documents from within their browser.

Sibyl builds and runs execution environments for reproducible document bundles. A *bundle* is a collection of one or more files that contain the source of the document, required data and/or specifications of dependencies. Sibyl fetches a bundle, checks the contents of the bundle, builds a container image for it, runs the container and opens the document:

- `fetch`: fetch a bundle from some remote or local location
- `check`: `fetch` + check that the necessary files are in the bundle
- `build`: `compile` + build a Docker image based on the contents of the bundle
- `launch`: `build` + start a container from the image

## Bundle addreses

A bundle _address_ is like a URL that tells Sibyl the location of the a bundle. Addresses follow the pattern:
 	
    scheme://path

The _scheme_ determines how Sibyl will `fetch` a bundle. There are several schemes available:

- [bitbucket://](bitbucket)
- [dat://](dat)
- [dropbox://](dropbox)
- [file://](file)
- [github://](github)
- [gitlab://](gitlab)
- [http://](http)

You can launch a bundle from its address in several ways

- using the form at http://open.stenci.la/

- using the address bar of your browser e.g. http://open.stenci.la/scheme://path

- using the command line tool `sibyl launch scheme://path`
    ```

## Bundle documents

Bundles usually have a "main" document - it's the document that is displayed when you "launch" a bundle. The main document is determined in the order of precedence from the following files:

1. `main.*`
2. `index.*`
3. `README.*`

where `*` can be one of the formats supported by Stencila. Currently, the supported formats are:

1. `md`
2. `html`
3. `ipynb`
4. `Rmd`

During the `check` stage, sibyl will warn you if you don't have a main document in your bundle. If you don't the `README.md` of the Stencila base image will be displayed.

> The whole Stencila platform is in beta. Currently, Sibyl uses the `0.27-preview` branch of the various Stencila packages. Support for `ipynb` and `Rmd` are preliminary and Stencila extensions for `md` and `html` are evolving.

> Currently, when the main document is opened in the browser you can edit it but you can't save it anywhere (although you can print to a PDF from the browser). We are working on adding the ability to save your document.

The main document is the document that is opened by default in the browser (at the url ending in `/~`). But a bundle can contain more than one document which can be accessed via the browser address bar (e.g. `/~/my-other-doc.Rmd`)


## Bundle data

Bundles can also contain data that are required by the main document e.g. csv files. All files that are in the bundle are loaded into the home directory of the container, next to the main document.


## Bundle requirements

During the `build` stage, Sibyl creates a container image for the bundle using a _base image_. Currently, there are three base images:

- [alpha](alpha): a comprehensive image for data analysis in Python, R and/or Node.js
- [rho](rho): an image for data analysis in R only
- [iota](iota): a minimal image for Sibyl development and testing

The default base image is `alpha`. It contains the Stencila packages for [Node.js](https://github.com/stencila/node), [Python](https://github.com/stencila/python) and [R](https://github.com/stencila/r) (which allows you to author documents containing code in these languages) as well as a large number of system libraries and packages for scientific computing. It aims to provide a computing environment that meets the needs of 95% of research documents.

If one of the base images does not meet your needs, you can [customize](customize-image) a bundle image by specifying one or more language requirements files. For more details for each language:

- [Node.js](node)
- [Python](python)
- [R](r)

If you find yourself having to customize an image a lot, particularly if you need to add missing packages, it might be an ideal opportunity to [contribute](contribute-image) to the library of base images.
