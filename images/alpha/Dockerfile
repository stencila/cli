# Base for the Stencila `alpha` channel of Docker images

# Currently this is optimised for development (rebuild times) and not
# for images sizes (will refactor for that later)

FROM ubuntu:16.04

# Add a user (creating home and specifying shell) and
# setup working environment
# This needs to be done before any node packages are installed so that they are
# available form `~/node_modules/` to be `require()`d (global modules cannot be)
RUN useradd --create-home --shell /bin/bash guest
WORKDIR /home/guest

# Turn off interactive installs
# See https://github.com/phusion/baseimage-docker/issues/58
ENV DEBIAN_FRONTEND noninteractive

# Install language runtimes and system packages that are frequently 
# required in research computing and/or for language packages
RUN apt-get update \
 && apt-get install -y \
    apt-transport-https \
    build-essential \
    curl \
    gcc \
    g++ \
    gfortran \
    jq \
    libcairo2-dev \
    libcurl4-openssl-dev \
    libgif-dev \
    libjpeg-dev \
    libssh2-1-dev \
    libssl-dev \
    libxml2-dev \
    software-properties-common \
 && curl --silent https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
 && add-apt-repository 'deb https://deb.nodesource.com/node_7.x xenial main' \
 && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9 \
 && add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' \
 && apt-get update \
 && apt-get install -y \
    nodejs \
    python python-dev python-pip \
    r-base r-base-dev \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/

# Install Node packages
RUN npm install \
      @stdlib/stdlib

# Install Python packages
RUN pip install --upgrade pip \
 && pip install \
    ipython \
    jupyter \
    matplotlib \
    numpy \
    pandas \
    scipy \
    sympy

# Install R packages
RUN Rscript -e "\
    install.packages(strsplit(' \
      devtools \
      tidyverse \
    ', ' +')[[1]][-1], lib='/usr/local/lib/R/site-library', repo='http://cran.rstudio.org/'); \
    devtools::install_github(strsplit(' \
    ', ' +')[[1]][-1]);"

# Install Stencila packages
# Currently here near the end for easy updating during development
RUN npm install https://github.com/stencila/node/tarball/0.27-preview
RUN pip install https://github.com/stencila/py/tarball/0.27-preview
RUN Rscript -e "devtools::install_github('stencila/r@0.27-preview')"

# Copy environment reflection script
COPY environ.sh .environ.sh
RUN chmod +x .environ.sh

# Copy README.md
COPY README.md .

# Switch to guest user
USER guest

# Install Stencila packages as guest user so that the
# host files are in home directory
RUN node -e "require('stencila-node').install()"
RUN python -c "import stencila; stencila.install()"
RUN Rscript -e "stencila:::install()"


CMD ["node", "-e", "require('stencila-node').run('0.0.0.0', 2000)"]
