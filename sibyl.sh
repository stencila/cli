#!/usr/bin/env bash

###############################################################################
#
# 0. Utilties
# 
# Utility functions and variables used below
# 
###############################################################################

# Assign colors if stdout is a terminal supporting colors
if test -t 1; then
  # Exclude from coverage
  # LCOV_EXCL_START
  ncolors=$(tput colors)
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
  # LCOV_EXCL_STOP
fi

# Indent lines
function indent {
  sed 's/^/    /'
}

# Print a STEP to terminal
function step {
  echo -e "${green}STEP${normal} $1 $2"
}

# Print some INFO to terminal
function info {
  echo -e "${blue}INFO${normal} $1"
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

# Translate a bundle address into a bundle name that
# can be used as
function name {
  local name
  # Translate non-ASCII characters, upper case to lower case, and 
  # any non-alpha-numerics to a dash
  name=$(echo "$1" | iconv -t ascii//TRANSLIT | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-')
  # Remove trailing dash and adjacent dashes
  name="${name##-}"
  name="${name%%-}"
  # Restrict to 200 characters so that we can meet Docker requirement
  # for repository names of less than 256 characters
  name="${name:0:200}"
  # Append SHA1 of address to improve probability of uniqueness
  local sha
  sha=$(echo "$1" | sha1sum)
  name="$name-${sha:0:10}"
  echo "$name"
}

# Get or set a property in a bundle's stencila.json
function property {
  if [ -z "$2" ]; then
    # Get (second arg not given)
    # If stencila.json is missing, or property is missing, return 'null'
    jq -r ".$1" stencila.json 2> /dev/null || echo 'null'
  else
    if [ ! -f stencila.json ]; then
      echo "{}" > stencila.json
    fi
    # Set (second arg given)
    # Ensure `stencila.json` exists
    test ! -e "stencila.json" && touch stencila.json
    # Inplace editing is not possible with jq so use a temp file
    # See https://github.com/stedolan/jq/wiki/FAQ#general-questions
    cat stencila.json <(echo "{\"$1\": $2}") | jq --slurp add > temp.json && mv temp.json stencila.json
  fi
}

# Get the image repository and tag for this bundle
function image_repo_tag {
  # In Docker a "repository" is any group of builds of an image with the same 
  # name, and potentially multiple tags (not to be confused with a Docker "registry")
  # See https://docs.docker.com/registry/spec/api/#overview for rules for repository
  # names
  local repository
  repository="stencila/bundles/$(property name)"
  # A tag is used for different builds of an image. We use the sha1 of the 
  # bundle
  local tag
  tag="$(property sha1)"

  echo "$repository:$tag"
}

# Does an image already exist for this bundle
function image_exists {
  # Get the repository and tag for this image
  local repo
  local tag
  IFS=':' read repo tag <<< $(image_repo_tag)
  # Is a registry being used?
  if [ -z "$SIBYL_REGISTRY" ]; then
    # No, check images locally
    docker images --quiet "$repo:$tag"
  else
    # Yes, check the registry
    curl "$SIBYL_REGISTRY/v2/$repo/manifests/$tag" | grep 404
  fi
}

###############################################################################
#
# Launch a document bundle
# 
###############################################################################

function launch {
  # Fetch the bundle and change into it's directory
  fetch "$1"
  # Is there already an image in the registry for this bundle state?
  if [ "$(image_exists)" == "" ]; then
    # No, so build and check it
    build
    check
  fi
  # Start it
  start
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
# - `github://user/repo/parent/folder` :  a folder in a Github repo
# 
###############################################################################

function fetch {
  step 1 'Fetch'

  local address
  address=$1 # Address e.g. http://example.com/path/archive.tar.gz/folder
  if [ "$address" == "" ]; then
    error "Nothing to fetch: usage \`${yellow}sybil fetch some-address-to-fetch${normal}\`"
  fi

  local bundle
  bundle=$(name "$address")

  local directory
  directory="./bundles/$bundle"

  read scheme path <<< "$(echo "$address" | sed -rn "s!^(file|github)://(.+)!\1 \2!p")"
  info "Fetching scheme '${cyan}$scheme${normal}' with path '${cyan}$path${normal}'"

  # Create the bundle directory if necessary
  mkdir -p "$directory"

  # Clean the bundle directory to ensure not files
  # exist from a previous fetch
  rm -rf "${directory:?}/*"

  # Enter directory and fetch
  pushd "$directory" > /dev/null
  case $scheme in
    file)   fetch_file "$path" ;;
    github) fetch_github "$path" ;;      
    *)      error "Unknown scheme: $scheme" ;;
  esac

  # Set the sha1 property : the SHA1 of files in the bundle
  local sha1
  sha1=$(find . -type f -print0 | sort -z | xargs -0 sha1sum | sha1sum | awk '{print $1}')
  property sha1 "\"$sha1\""

  # Set the name property
  property name "\"$bundle\""
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
  cp -R "$path/." "."
}

function fetch_file_archive {
  path=$1 # Address path i.e. path/archive.tar.gz/folder

  read archive folder <<< "$(echo "$path" | sed -r "s!^(.*(\.tar\.gz))(/(.+))?!\1 \4!")"
  info "Fetching from file archive '${cyan}$archive${normal}' folder '${cyan}$folder${normal}'"

  # Check the folder exists in the archive
  lines=$(tar -tf "$archive" "$folder" 2> /dev/null | wc -l)
  if [ "$lines" == "0" ]; then
    error "Folder '$cyan$folder$normal' does not exist in archive '$cyan$archive$normal'"
  fi
  
  # Determine the depth of folder by counting forward slashes followed by a name
  if [ "$folder" != "" ]; then
    depth=$(grep -c "/\w\w*" <<< "$folder")
    depth=$((depth+1))
  else
    depth=0
  fi

  # Extract it
  tar --strip-components=$depth -xzf "$archive" "$folder"
}

function fetch_github {
  path=$1 # Address path i.e. repo/user/folder

  read user repo folder <<< "$(echo "$path" | sed -r "s!^([^/]+?)/([^/]+)(/(.+))?!\1 \2 \4!")"
  info "Fetching Github repo '${cyan}$user/$repo${normal}' folder '${cyan}$folder${normal}'"

  # Download the archive
  local archive
  archive=$(mktemp --dry-run --suffix '.tar.gz')
  curl --silent --show-error --location "https://github.com/$user/$repo/tarball/master" > "$archive"

  # Get the name of the root directory and strip off the trailing slash
  local root
  root=$(tar --exclude='*/*' -tf "$archive")

  # Fetch from the file archive
  fetch_file_archive "$archive/$root$folder"
}

###############################################################################
#
# Build a container image for the bundle
# 
###############################################################################

# Compile a Dockerfile
function compile {

  # Check if no Dockerfile exists, or if it was previously generated by sibyl
  if [ -f Dockerfile ]; then
    generator=$(sed -rn 's/# Generated by (sibyl)/\1/p' Dockerfile)
  fi
  if [ ! -f Dockerfile ] || [ "$generator" == "sibyl" ]; then
    info "Compiling ${cyan}new${normal} Dockerfile"
  else
    info "Using ${cyan}existing${normal} Dockerfile"

    # Check that the Dockerfile is based off stencila/alpha
    if [ "$(grep -c '^FROM stencila/alpha\s*$' Dockerfile)" != "1" ]; then
      error "Dockerfile is not based on stencila/alpha"
    fi

    return
  fi

  # Header used to detect if the bundle has a custom Dockerfile or one generatred by sibyl
  # We used to put a time stamp in the header but that makes it harder to test for
  # expected output
  printf "# Generated by sibyl\n\n" > Dockerfile

  # Base image
  printf "FROM stencila/alpha\n" >> Dockerfile

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

  # Archive the contents of the directory
  tar czf stencila.tar.gz --exclude "./Dockerfile" --exclude "./stencila.*" .

  # Copy and extract tarball into container
  printf "COPY stencila.tar.gz stencila.tar.gz\nRUN tar xf stencila.tar.gz && rm stencila.tar.gz\n" >> Dockerfile

  # Update the image property
  property image "{
    \"compiled\": \"$(date --iso-8601=seconds)\"
  }"
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
    cat >> Dockerfile << EOL
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

    major=$(echo "$version" | sed -rn 's/([0-9]+)\..+/\1/p')

    cat >> Dockerfile << EOL
RUN curl -s "https://deb.nodesource.com/node_$major.x/pool/main/n/nodejs/nodejs_$version-1nodesource1~xenial1_amd64.deb" > node.deb \\
 && dpkg -i node.deb \\
 && rm node.deb
EOL

  fi

  # Parse dependencies in package.json into lines of name@version which can be xarged into
  # a npm global install
  # Trying a npm global install on the package.json fails
  jq -r '.dependencies' package.json | sed -rn 's/  "([^"]+)": "([^"]+)",?/\1@\2/p' > node-requires.txt

  cat >> Dockerfile << EOL
COPY node-requires.txt node-requires.txt
RUN cat node-requires.txt | xargs npm install --global
EOL

}

# Install Python and packages
function install_python {

  # Get the Python version from requirements file e.g.
  #   # python==2.7
  # Note that any patch number in the version will be ignored
  version=$(sed -rn 's/# *(P|p)ython==([0-9](\.[0-9]+)?).*/\2/p' requirements.txt)
  major=$(echo "$version" | sed -rn 's/([0-9]+).*/\1/p')

  # Install Python and pip
  if [ "$version" == "" ]; then
    info "Installing ${cyan}latest${normal} Python$major"

    cat >> Dockerfile << EOL
RUN apt-get update \\
 && apt-get install -y python$major python$major-dev python$major-pip \\
 && apt-get clean \\
 && rm -rf /var/lib/apt/lists
EOL

  else
  
    info "Installing Python ${cyan}$version${normal}"

    cat >> Dockerfile << EOL
RUN add-apt-repository ppa:fkrull/deadsnakes \\
 && apt-get update \\
 && apt-get install -y python$version python$version-dev python$major-pip \\
 && apt-get clean \\
 && rm -rf /var/lib/apt/lists
EOL

  fi

  # Upgrade pip and install required packages
  cat >> Dockerfile << EOL
COPY requirements.txt requirements.txt
RUN pip$major install --upgrade pip \\
 && pip$major install -r requirements.txt
EOL

}

# Install R and packages
function install_r {

  # Get the R version from requirements file e.g.
  #   # R==3.1.1
  version=$(sed -rn 's/# *(R|r)==([0-9]\.[0-9]+\.[0-9]+)/\2/p' r-requires.txt)

  # Install R
  if [ "$version" != "" ]; then
    suffix="=$version-1xenial0"
    info "Installing R${cyan}$suffix${normal}"
  else
    info "Installing ${cyan}latest${normal} R"
  fi

  cat >> Dockerfile << EOL
RUN add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' \\
 && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9 \\
 && apt-get update \\
 && apt-get install -y --no-install-recommends r-base-core$suffix r-base-dev$suffix \\
 && apt-get clean \\
 && rm -rf /var/lib/apt/lists
EOL

  # Create a package installation script
  cat > r-requires.R << EOL
options(repos=structure(c(CRAN='https://cran.rstudio.com')))
install.packages('devtools')
$(sed -rn "s/^([a-zA-Z0-9]+)==(.*)/devtools::install_version('\1', '\2')/p" r-requires.txt)
devtools::install_github('stencila/r')
stencila:::install()
EOL

  # Run package installation script
  printf "COPY r-requires.R r-requires.R\n" >> Dockerfile
  printf "RUN Rscript r-requires.R\n" >> Dockerfile

}

# Build a container image
function build {
  step '2' 'Build'

  compile

  # Get the repository and tag for this image
  local repo
  local tag
  IFS=':' read repo tag <<< $(image_repo_tag)

  info "Building Docker image $cyan$repo:$tag$normal"
  docker build --tag "$repo:$tag" . | indent

  # Update the image property
  property image "{
    \"compiled\": \"$(property image.compiled)\",
    \"built\": \"$(date --iso-8601=seconds)\",
    \"repository\": \"$repo\",
    \"tag\": \"$tag\",
    \"platform\": {
      \"name\": \"docker\",
      \"version\": \"$(docker --version | sed -rn 's!Docker version (.*)!\1!p')\"
    }
  }"
}


###############################################################################
#
# Check the container has the expected environment
# 
###############################################################################

function check {
  step 3 'Check'

  info 'Running container to check its environment'
  docker run "$(image_repo_tag)" bash stencila-environ.sh > stencila-environ.json

  # TODO compare stencila-environ.json with what was meant to be installed
}


###############################################################################
#
# Start a container
# 
###############################################################################

function start {
  step 4 'Start'

  # Find a port for container to publish to localhost
  local port_used="maybe"
  while [ "$port_used" != "" ]; do
      port=$(( ( RANDOM % 60000 )  + 1025 ))
      port_used=$(netstat --listening --all --tcp --numeric | grep ":$port")
  done

  # Set a timeout
  local timeout=3600

  info "Starting container on port $cyan$port$normal with timeout $cyan$timeout$normal seconds"
  id=$(docker run --publish $port:2000 --detach "$(image_repo_tag)" node -e "require('stencila-node').run('0.0.0.0', 2000, $timeout)")
  info "Container $cyan$id$normal started"

  echo -e "${magenta}GOTO${normal} $port"
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

# Run specified task
if [ "$1" == "" ]; then
  error "No task supplied. Usage: sibyl <task> [<arg>, ...] [--<option>, ...]"
else
  case $1 in
    sourced) ;; # Just to allow test file to source this silently

    # Inspection

    property) property "$2" "$3" ;;
    image_repo_tag) image_repo_tag ;;
    registered) registered ;;

    # Tasks

    fetch) fetch "$2" ;;

    build) build ;;
      compile) compile ;;
    
    check) check ;;
  
    start) start ;;

    launch) launch "$2" ;;
      
    *)
      error "Unknown task: $1"
      ;;
  esac
fi

# LCOV_EXCL_STOP
