# Base for the Stencila `alpha` channel of Docker images

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
    libssl-dev \
    libxml2-dev \
    software-properties-common \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/

# Install node
RUN curl -sL "https://deb.nodesource.com/setup_7.x" | bash \
 && apt-get install -y nodejs \
 && npm install --global stencila-node

# Add a user (creating home and specifying shell) and
# setup working environment
RUN useradd --create-home --shell /bin/bash guest
USER guest
WORKDIR /home/guest
