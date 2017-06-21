# A base image that attempts to be as small as possible
# while still providing a Stencila Host within the container.
#
# Intended for use during development to provide a quick to
# pull container image. But provides limited functionalty (ie. no R or Python)
#
# Currently, the smallest way to provide a Stencila Host is
# to install Node and the `stencila-node` package.
# But in the future could involve a binary executable compiled
# from C++ or Go or some other language.

FROM node:alpine

# There is already a guest user so just use its home
WORKDIR /home/guest

# Unfortunately, `stencila-node` is dependent upon `canvas`
# which requires `node-gyp` and Python to be installed. Those
# depenedncies may be able to be removed in the future.
RUN apk add --no-cache --virtual .gyp \
     python \
     make \
     g++ \
 && npm install https://github.com/stencila/node/tarball/0.27-preview \
 && apk del .gyp

# Copy environment reflection script
COPY environ.sh .environ.sh
RUN chmod +x .environ.sh

# Copy README.md
COPY README.md .

# Switch to guest user
USER guest

CMD ["node", "-e", "require('stencila-node').run('0.0.0.0', 2000)"]
