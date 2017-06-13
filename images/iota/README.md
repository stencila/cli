# iota (ι)

The `iota` base image attempts to be as small as possible while still providing a Stencila Host within the container.

Intended for use during development to provide a quick to pull container image. But provides limited functionalty (ie. no R or Python)

Currently, the smallest way to provide a Stencila Host is to install Node and the `stencila-node` package.
But in the future could involve a binary executable compiled from C++ or Go or some other language.
