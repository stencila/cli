# Base for the Stencila `alpha` channel of Docker images

# Currently this is optimised for development (rebuild times) and not
# for images sizes (will refactor for that later)

FROM ubuntu:16.04

# Turn off interactive installs
# See https://github.com/phusion/baseimage-docker/issues/58
ENV DEBIAN_FRONTEND noninteractive

# Install system packages that are frequently required in research computing
# and/or for installation of language runtimes and packages
RUN apt-get update \
 && apt-get install -y \
    apt-transport-https \
    build-essential \
    curl \
    gcc \
    g++ \
    gfortran \
    jq \
    libcurl4-openssl-dev \
    libssh2-1-dev \
    libssl-dev \
    libxml2-dev \
    software-properties-common \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/

###############################################################################

# Install Node.js
RUN curl -sL "https://deb.nodesource.com/setup_7.x" | bash \
 && apt-get install -y nodejs \
 && npm install --global stencila-node

###############################################################################

# Install R and any other libraries required by R packages
RUN add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' \
 && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9 \
 && apt-get update \
 && apt-get install -y r-base r-base-dev \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/

# Install R packages
RUN Rscript -e "\
      install.packages(strsplit(' \
        devtools \
      ', ' +')[[1]][-1], lib='/usr/local/lib/R/site-library', repo='http://cran.rstudio.org/'); \
      devtools::install_github(strsplit(' \
        stencila/r \
      ', ' +')[[1]][-1]); \
      stencila:::install();"

###############################################################################

# Add a user (creating home and specifying shell) and
# setup working environment
RUN useradd --create-home --shell /bin/bash guest
USER guest
WORKDIR /home/guest

# Copy environment reflection script
COPY stencila-environ.sh stencila-environ.sh
