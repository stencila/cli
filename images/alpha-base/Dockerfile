# Base for the Stencila `alpha` channel of Docker images

FROM ubuntu:16.04

# Turn off interactive installs
# See https://github.com/phusion/baseimage-docker/issues/58
ENV DEBIAN_FRONTEND noninteractive

# Install system packges that are frequently required in research computing
# and/or for installation of language runtimes and packages
RUN apt-get update \
 && apt-get install -y \
    apt-transport-https \
    build-essential \
    curl \
    gcc \
    g++ \
    gfortran \
    libcurl4-openssl-dev \
    libssl-dev \
    software-properties-common \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/
