#!/usr/bin/env bash

###############################################################################
#
# Configuration options
#
# The defaults below are intended for development using a local
# Docker engine. For development using Minikube, or for deployment,
# you'll need to change them.
#
###############################################################################

# The name of the Docker image to use in Docker file `FROM` statements
# Default is the minimal `iota` image
: "${SIBYL_FROM:=stencila/iota}"

# A flag for whether *bundle containers* should be run in a cluster or not
# Leave empty string to use `docker run ...`, set as "true" to run
# in a cluster using `kubectl create ...`
: "${SIBYL_CLUSTER:=}"

# The private registry for pushing and pulling bundle images
: "${SIBYL_REGISTRY:=}"

###############################################################################
#
# Output and mocking functions and variables
#
###############################################################################

# Exclude from coverage
# LCOV_EXCL_START

# Assign colors if stdout is a terminal supporting colors
if test -t 1; then
  ncolors=$(command -v tput >/dev/null 2>&1 && tput colors)
  if test -n "$ncolors" && test "$ncolors" -ge 8; then
    #bold="$(tput bold)"
    #underline="$(tput smul)"
    #standout="$(tput smso)"
    normal="$(tput sgr0)"
    #black="$(tput setaf 0)"
    red="$(tput setaf 1)"
    green="$(tput setaf 2)"
    yellow="$(tput setaf 3)"
    blue="$(tput setaf 4)"
    magenta="$(tput setaf 5)"
    cyan="$(tput setaf 6)"
    #white="$(tput setaf 7)"
  fi
fi

# Use coreutils version of "sed" if available.
if gsed --help 2&> /dev/null; then
  sed="gsed"
else
  sed="sed"
fi

# Indent lines
function indent {
  "$sed" 's/^/    /'
}

# Print a STEP to terminal
function step {
  echo -e "${green}STEP${normal} $1"
}

# Print some INFO to terminal
function info {
  echo -e "${blue}INFO${normal} $1"
}

# Print a WARN to terminal
function warn {
  echo -e "${yellow}WARN${normal} $1"
}

# Print an ERROR to stderr and exit
function error {
  echo -e "${red}ERROR${normal} $1" 1>&2
  exit 1
}

# Mock time consuming processes.
# Used during development and testing
function mock {
  function curl {
    echo "Mocking 'curl $*'"
  }
  function docker {
    echo "Mocking 'docker $*'"
  }
}

# Unset mocking functions
function unmock {
  unset curl
  unset docker
}

# LCOV_EXCL_STOP

###############################################################################
#
# Bundle inspection
#
###############################################################################

# Translate a bundle address into a unique bundle name that
# can be used as a Docker repository name
function bundle_name {
  if [ "$1" != "" ]; then
    local name_
    # Translate upper case to lower case, and
    # any non-alpha-numerics to a dash
    # This used to include `iconv -t ascii//TRANSLIT` to translate non-ASCII
    # chars but that is not available in [Alpine Linux](https://github.com/gliderlabs/docker-alpine/issues/216)
    name_=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-')
    # Remove trailing dash and adjacent dashes
    name_="${name_##-}"
    name_="${name_%%-}"
    # Restrict to 200 characters so that we can meet Docker requirement
    # for repository names of less than 256 characters
    name_="${name_:0:200}"
    # Append SHA1 of address to improve probability of uniqueness
    local sha_
    sha_=$(echo "$1" | sha1sum)
    name_="$name_-${sha_:0:10}"
    echo "$name_"
  else
    basename "$PWD"
  fi
}

# SHA1 of files in the bundle
function bundle_sha {
  find . -type f -not -path "./.sibyl/*" -print0 | sort -z | xargs -0 sha1sum | sha1sum | awk '{print $1}'
}

# Get the Docker image repository name and tag for the current bundle
# In Docker a "repository" is any group of builds of an image with the same
# name, and potentially multiple tags (not to be confused with a Docker "registry")
# See https://docs.docker.com/registry/spec/api/#overview for rules for repository
# names
function image_repo {
  if [ "$SIBYL_REGISTRY" == "" ]; then
    echo "sibyl-$(bundle_name "")"
  else
    echo "$SIBYL_REGISTRY/$(bundle_name "")"
  fi
}

function image_tag {
  bundle_sha
}

function image_id {
  echo "$(image_repo):$(image_tag)"
}


###############################################################################
#
# Fetch a bundle from an address:
#
# - `file://parent/folder` : a folder on the local filesystem
#
# - `file://path/archive(.zip|tar.gz)/folder` : a folder within a file
#    archive on the local filesystem
#
# - `github://user/repo/parent/folder` : a folder in a Github repo
#
# - `dat://key` : a Dat repo
#
###############################################################################

function fetch {
  # If not called with any argument, then already fetched and
  # nothing to do
  if [ "$1" == "" ]; then
    return
  fi

  step "Fetch"

  local dir_
  dir_="./bundles/$(bundle_name "$1")"

  # Remove the bundle directory to ensure no files
  # exist from a previous fetch
  rm -rf "$dir_"

  # Create the bundle directory and enter it
  mkdir -p "$dir_"
  pushd "$dir_" > /dev/null
  info "Changed to directory $cyan'$PWD'$normal"

  # Do the fetch!
  read -r scheme_ path_ <<< "$(echo "$1" | "$sed" -rn "s!^(file|github|dat)://(.+)!\1 \2!p")"
  info "Fetching scheme '$cyan$scheme_$normal' with path '$cyan$path_$normal'"
  case $scheme_ in
    file)   fetch_file "$path_" ;;
    github) fetch_github "$path_" ;;
    dat)    fetch_dat "$path_" ;;
    *)      error "Unknown scheme: $scheme_" ;;
  esac

  # Exit the directory unless called with second argument
  # (within another task e.g. `fetch "$1" "continue"`)
  if [ "$2" == "" ]; then
    popd > /dev/null
  fi
}

# Fetch from the local filesystem
function fetch_file {
  local path=$1
  info "Fetching from filesystem '$cyan$path$normal'"
  if [ ! -e "$path" ]; then
    error "Path '$cyan$path$normal' does not exist"
  elif [ -d "$path" ]; then
    fetch_file_directory "$path"
  else
    fetch_file_archive "$path"
  fi
}

function fetch_file_directory {
  local path=$1 # Filesystem path i.e. ./parent/folder

  info "Fetching from directory '$cyan$path$normal'"
  cp -R "$path"/. .
}

function fetch_file_archive {
  local path=$1 # Address path i.e. path/archive.tar.gz/folder

  # Get the archive file path and folder to extract from the address path
  local archive
  local folder
  read -r archive folder <<< "$(echo "$path" | "$sed" -r "s!^(.*(\.tar\.gz))(/(.+))?!\1 \4!")"
  info "Fetching from file archive '${cyan}$archive${normal}' folder '${cyan}$folder${normal}'"

  # Extract into a temporary dir, move contents (including dot files)
  # to here and then tidy up
  local temp
  temp=$(mktemp -d)
  if [ "$folder" == "" ]; then
    tar -xzf "$archive" -C "$temp"
    mv "$temp"/* "$temp"/.[!.]* . 2> /dev/null
  else
    if [ "$(tar -tf "$archive" "$folder" 2> /dev/null | wc -l)" == "0" ]; then
      error "Folder '$cyan$folder$normal' does not exist in archive '$cyan$archive$normal'"
    fi
    tar -xzf "$archive" -C "$temp" "$folder"
    mv "$temp/$folder"/* "$temp/$folder"/.[!.]* . 2> /dev/null
  fi
  rm -rf "$temp"
}

function fetch_github {
  path=$1 # Address path i.e. repo/user/folder

  read -r user repo folder <<< "$(echo "$path" | "$sed" -r "s!^([^/]+?)/([^/]+)(/(.+))?!\1 \2 \4!")"
  info "Fetching Github repo '${cyan}$user/$repo${normal}' folder '${cyan}$folder${normal}'"

  # Download the archive
  local archive
  archive="$(mktemp -d)/archive.tar.gz"
  curl --silent --show-error --location "https://github.com/$user/$repo/tarball/master" > "$archive"

  # Get the name of the root directory
  local root
  root=$(tar -tf "$archive" | head -n 1)

  # Fetch from the file archive
  fetch_file_archive "$archive/$root$folder"

  # Tidy up by removing the archive
  rm "$archive"
}


function fetch_dat {
  info "Fetching Dat repo '${cyan}$1${normal}'"
  info "Running '${cyan}dat $1 . --exit${normal}'"

  # Download the archive
  dat "$1" . --exit | indent
}


###############################################################################
#
# Check a bundle has a supported layout
#
###############################################################################

function check {
  fetch "$1" "continue"

  step "Check"

  # Check for a 'main' file
  # shellcheck disable=SC2012
  if [ "$(ls main.* index.* README.* -1 2>/dev/null | wc -l)" == 0 ]; then
    warn "Unsupported layout"
  fi
}


###############################################################################
#
# Compile a Dockerfile for the bundle
#
###############################################################################

function compile {
  check "$1" "continue"

  mkdir -p .sibyl

  # Check if the bundle already has a Dockerfile
  if [ -f Dockerfile ]; then
    info "Using ${cyan}existing${normal} Dockerfile"

    # Check that the Dockerfile is based off a Stencila image
    if [ "$(grep -Ec '^FROM stencila/[[:alnum:]]+\s*$' Dockerfile)" != "1" ]; then
      error "Dockerfile is not based on Stencila base image"
    fi

    return
  fi

  # Base image
  echo "FROM $SIBYL_FROM" > .sibyl/Dockerfile

  # Copy and extract tarball into container
  echo "COPY . ." >> .sibyl/Dockerfile

  # Ignore the Dockerfile when doing `COPY`
  echo "Dockerfile" >> .sibyl/.dockerignore

  # Node.js
  if [ -f package.json ]; then
    install_node
  fi

  # Python
  if [ -f requirements.txt ]; then
    install_python
  fi

  # R
  if [ -f r-requires.txt ]; then
    install_r
  fi
}

# Install Node.js and packages
function install_node {
  # Get the node version from package.json e.g.
  #   "engines": {
  #      "node": "7.9.0"
  #   }
  # See https://docs.npmjs.com/files/package.json#engines
  version=$(jq -r '.engines.node' package.json)

  if [ "$version" == "null" ]; then
    # Install latest Nodes
    info "Using ${cyan}latest${normal} Node.js"
    cat >> .sibyl/Dockerfile << EOL
RUN curl -sL "https://deb.nodesource.com/setup_7.x" | bash \\
 && apt-get install -y nodejs
EOL

  else
    # Install specific deb
    # This is currently Nodesource's suggested method for installing a pinned version
    # see https://github.com/nodesource/distributions#faq.
    # Alternatives include NVM and n-install (https://github.com/mklement0/n-install) but
    # they are heavier solutions
    info "Using Node.js ${cyan}$version${normal}"

    major=$(echo "$version" | "$sed" -rn 's/([0-9]+)\..+/\1/p')

    cat >> .sibyl/Dockerfile << EOL
RUN curl -s "https://deb.nodesource.com/node_$major.x/pool/main/n/nodejs/nodejs_$version-1nodesource1~xenial1_amd64.deb" > node.deb \\
 && dpkg -i node.deb \\
 && rm node.deb
EOL

  fi

  # Parse dependencies in package.json into lines of name@version which can be xarged into
  # a npm global install
  jq -r '.dependencies' package.json | "$sed" -rn 's/  "([^"]+)": "([^"]+)",?/\1@\2/p' > .sibyl/node-requires.txt

  cat >> .sibyl/Dockerfile << EOL
RUN cat ".sibyl/node-requires.txt" | xargs npm install
EOL

}

# Install Python and packages
function install_python {

  # Get the Python version from requirements file e.g.
  #   # python==2.7
  # Note that any patch number in the version will be ignored
  version=$("$sed" -rn 's/# *(P|p)ython==([0-9](\.[0-9]+)?).*/\2/p' requirements.txt)
  major=$(echo "$version" | "$sed" -rn 's/([0-9]+).*/\1/p')

  # Install Python and pip
  if [ "$version" == "" ]; then
    info "Installing ${cyan}latest${normal} Python$major"

    cat >> .sibyl/Dockerfile << EOL
RUN apt-get update \\
 && apt-get install -y python$major python$major-dev python$major-pip \\
 && apt-get clean \\
 && rm -rf /var/lib/apt/lists
EOL

  else

    info "Installing Python ${cyan}$version${normal}"

    cat >> .sibyl/Dockerfile << EOL
RUN add-apt-repository ppa:fkrull/deadsnakes \\
 && apt-get update \\
 && apt-get install -y python$version python$version-dev python$major-pip \\
 && apt-get clean \\
 && rm -rf /var/lib/apt/lists
EOL

  fi

  # Upgrade pip and install required packages
  cp requirements.txt ".sibyl/py-requires.txt"

  cat >> .sibyl/Dockerfile << EOL
RUN pip$major install --upgrade pip \\
 && pip$major install -r ".sibyl/py-requires.txt"
EOL

}

# Install R and packages
function install_r {

  # Get the R version from requirements file e.g.
  #   # R==3.1.1
  version=$("$sed" -rn 's/# *(R|r)==([0-9]\.[0-9]+\.[0-9]+)/\2/p' r-requires.txt)

  # Install R
  if [ "$version" != "" ]; then
    suffix="=$version-1xenial0"
    info "Installing R${cyan}$suffix${normal}"
  else
    info "Installing ${cyan}latest${normal} R"
  fi

  cat >> .sibyl/Dockerfile << EOL
RUN add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' \\
 && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9 \\
 && apt-get update \\
 && apt-get install -y --no-install-recommends r-base-core$suffix r-base-dev$suffix \\
 && apt-get clean \\
 && rm -rf /var/lib/apt/lists
EOL

  # Create a package installation script
  cat > .sibyl/r-requires.R << EOL
options(repos=structure(c(CRAN='https://cran.rstudio.com')))
install.packages('devtools')
$("$sed" -rn "s/^([a-zA-Z0-9]+)==(.*)/devtools::install_version('\1', '\2')/p" r-requires.txt)
devtools::install_github('stencila/r')
stencila:::install()
EOL

  # Run package installation script
  printf "RUN Rscript .sibyl/r-requires.R\n" >> .sibyl/Dockerfile

}


###############################################################################
#
# Build a container image for a bundle
#
###############################################################################

function build {
  check "$1" "continue"

  step "Build"

  local image_id
  image_id=$(image_id)

  # Is Google Container Registry (gcr.io) being used?
  local gcr
  gcr=$(echo "$SIBYL_REGISTRY" | grep -c '^gcr.io')

  # Is the image already built?
  local image_exists
  # Is a Docker registry being used?
  if [ "$SIBYL_REGISTRY" == "" ]; then
    # No, check images locally
    image_exists=$(docker images --quiet "$image_id")
  else
    # Yes, check the registry
    local image_repo
    image_repo=$(image_repo)
    local image_tag
    image_tag=$(image_tag)
    
    if [ "$gcr" == "1" ]; then
      if [ "$(gcloud container images list-tags "$image_repo" | grep -c "$image_tag")" == "1" ]; then
        image_exists="true"
      fi
    else
      if [ "$(curl -I -s -o /dev/null -w "%{http_code}" "http://$SIBYL_REGISTRY/v2/$image_repo/manifests/$image_tag")" == "200" ]; then
        image_exists="true"
      fi
    fi
  fi
  if [ "$image_exists" != "" ]; then
    info "Image already built: $cyan'$image_id'$normal"
    return
  fi

  compile

  # Create symlinks necessary for Docker build
  for file in "Dockerfile" ".dockerignore"; do
    if [ ! -f "$file" ] && [ -f .sibyl/"$file" ]; then
      ln -s .sibyl/"$file"
    fi
  done

  # Build the Docker image
  info "Building image: $cyan'$image_id'$normal"
  docker build --tag "$image_id" . | indent

  if [ "$SIBYL_REGISTRY" != "" ]; then
    # Push to the registry
    if [ "$gcr" == "1" ]; then
      gcloud docker -- push "$image_id" | indent
    else
      docker push "$image_id" | indent
    fi
  fi

  # Remove any symlinks created
  find . -type l -delete
}

###############################################################################
#
# Launch a container
#
###############################################################################

function launch {
  build "$1"

  step "Launch"

  local image_id
  image_id=$(image_id)

  # A unique name for the session container
  local name
  name="sibyl-session-$(( RANDOM ))"

  # Command to run the Stencila host
  local cmd
  cmd="require('stencila-node').run('0.0.0.0', 2000, 3600)"

  # We'll get IP and/or port so that the user can be redirected
  # to the running bundle container
  local ip
  local port

  # Run a container using...
  if [ "$SIBYL_CLUSTER" == "" ]; then
    # ...the local Docker engine

    # IP is localhost
    ip="127.0.0.1"
    # Port is random available port
    local port_used="maybe"
    while [ "$port_used" != "" ]; do
        port=$(( ( RANDOM % 60000 )  + 1025 ))
        port_used=$(netstat -latn | grep ":$port")
    done

    info "Launching session name:$cyan$name$normal port:$cyan$port$normal"
    docker run --name "$name" --publish "$port:2000" --detach "$image_id" node -e "$cmd" | indent

  else
    # ...the Kubernetes cluster

    info "Launching session name:$cyan$name$normal"
    cat << EOF | kubectl create -f -

kind: Pod
apiVersion: v1
metadata:
  name: $name
spec:
  containers:
    - name: bundle-container
      image: $image_id
      command: ["node"]
      args: ["-e", "$cmd"]
      ports:
        - containerPort: 2000
      resources:
        requests:
          memory: "128Mi"
          cpu: "250m"
        limits:
          memory: "256Mi"
          cpu: "500m"
  restartPolicy: Never
EOF

    # Wait for container to be ready
    while [ "$(kubectl get pod "$name" -o json | jq -r .status.phase)" != "Running" ]; do
      info "Waiting for session to be ready"
      sleep 1
    done

    # Get the container's IP
    ip=$(kubectl get pod "$name" -o json | jq -r .status.podIP)
    port="2000"

  fi

  echo -e "${magenta}GOTO${normal} http://$ip:$port"
}


###############################################################################
#
# Main entry point
#
###############################################################################
# Exclude from coverage
# LCOV_EXCL_START

# Check for options
for arg in "$@"; do
  if [ "$arg" == "--mock" ]; then
    mock "$@"
  fi
done

# Is Sibyl is being executed (not sourced)?
if [ "${BASH_SOURCE[0]}" == "$0" ]; then
  if [ "$1" == "" ]; then
    # No arguments were supplied
    error "No task supplied. Usage: sibyl <task> [<arg>, ...] [--<option>, ...]"
  else
    case $1 in
      # Inspection

      bundle_name) bundle_name ;;
      bundle_sha) bundle_sha ;;
      image_id) image_id ;;

      # Tasks

      fetch) fetch "$2" ;;
      compile) compile "$2" ;;
      build) build "$2" ;;
      check) check "$2" ;;
      launch) launch "$2" ;;

      *)
        error "Unknown task: $1"
        ;;
    esac
  fi
fi

# LCOV_EXCL_STOP
