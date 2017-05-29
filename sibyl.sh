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
  function wget {
    echo "Mocking 'wget $*'"
  }
  function docker {
    echo "Mocking 'docker $*'"
  }
}

# Unset mocking functions
function unmock {
  unset wget
  unset docker
}

# Get or set a property from stencila.json
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

###############################################################################
#
# 0. Initialize
# 
###############################################################################

function init {
  step 0 'Initialize'

  address="$1"
  name=$(echo "$1" | tr ":/" "-")
  folder="folders/$name"
  info "Initializing folder $cyan$folder$normal for address $cyan$address$normal"

  mkdir -p "$folder"
  pushd "$folder" > /dev/null
  property name "\"$name\""
}


###############################################################################
#
# 1. Fetch
# 
# Fetch a folder from an address:
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

  address=$1 # Address e.g. http://example.com/path/archive.tar.gz/folder
  origin=$(property origin) # Exisiting path in stencila.json

  # If address was supplied, check that it does not conflict with existing origin
  if [ "$address" == "" ]; then
    if [ "$origin" == "null" ]; then
      error "Nothing to fetch: usage \`${yellow}sybil fetch some-address-to-fetch${normal}\`"
    else
      address=$origin
    fi
  else
    if [ "$origin" == "null" ]; then
      origin="$address"
      property origin "\"$address\""
    fi
    if [ "$address" != "$origin" ]; then
      error "Attempting to fetch address \`${cyan}$address${normal}\` when origin is already \`${cyan}$origin${normal}\`"
    fi
  fi

  read scheme path <<< "$(echo "$address" | sed -rn "s!^(file|github)://(.+)!\1 \2!p")"
  info "Fetching using scheme '${cyan}$scheme${normal}' with path '${cyan}$path${normal}'"

  case $scheme in
    file)   fetch_file "$path" ;;
    github) fetch_github "$path" ;;      
    *)      error "Unknown scheme: $scheme" ;;
  esac
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

  # Dowload the archive
  archive=$(mktemp --dry-run --suffix '.tar.gz')
  wget -O "$archive" "https://github.com/$user/$repo/tarball/master"

  # Get the name of the root directory and strip off the trailing slash
  root=$(tar --exclude='*/*' -tf "$archive")

  # Fetch from the file archive
  fetch_file_archive "$archive/$root$folder"
}


###############################################################################
#
# 2. Build
# 
# Build an environment for the folder
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

  # Header used to detect if the folder has a custom Dockerfile or one generatred by sibyl
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

  # Calculate a sha of files in the directory
  local sha
  sha=$(find . -type f -not -path './stencila.*' -print0 | sort -z | xargs -0 sha1sum | sha1sum | awk '{print $1}')

  # If the contents have changed then create tarball
  if [ "$sha" != "$(property sha)" ] || [ ! -f stencila.tar.gz ]; then
    # Archive the contents of the directory
    tar czf stencila.tar.gz --exclude "./Dockerfile" --exclude "./stencila.*" .
  fi

  # Copy and extract tarball into container
  printf "COPY stencila.tar.gz stencila.tar.gz\nRUN tar xf stencila.tar.gz && rm stencila.tar.gz\n" >> Dockerfile

  # Update stencila.json with image details
  local temp_file
  temp_file=$(mktemp)
  cat > "$temp_file" << EOF
{
  "sha": "$sha",
  "image": {
    "platform": {
      "name": "docker",
      "version": "$(docker --version | sed -rn 's/Docker version (.*)/\1/p')"
    },
    "name": "stencila/$(echo "$PWD" | sha1sum | awk '{print $1}')"
  }
}
EOF
  test ! -e "stencila.json" && touch stencila.json
  cat stencila.json "$temp_file" | jq --slurp add > temp.json && mv temp.json stencila.json
  
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

  info 'Building Docker image'
  docker build --tag "$(property image.name)" . | indent
}


###############################################################################
#
# 3. Check
# 
# Check the container has the expected environment
# 
###############################################################################

function check {
  step 3 'Check'

  info 'Running container to check its environment'
  docker run "$(property image.name)" bash stencila-environ.sh > stencila-environ.json

  # TODO compare stencila-environ.json with what was meant to be installed
}


###############################################################################
#
# 4. Start
# 
# Start the document
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

  info "Starting container on port $cyan$port$normal"
  id=$(docker run --publish $port:2000 --detach "$(property image.name)" stencila-node)
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

    # Tasks that can be useful during development

    property) property "$2" "$3" ;;
    name) name ;;  # e.g. `docker run -it $(sibyl name)`

    # Steps can be run individually...

    init) init "$2" ;;

    fetch) fetch "$2" ;;

    build) build ;;
      compile) compile ;;
    
    check) check ;;
  
    start) start ;;

    # but `launch` runs all steps.

    launch)
      init "$2"
      fetch "$2"
      build
      check
      start
      ;;
      
    *)
      error "Unknown task: $1"
      ;;
  esac
fi

# LCOV_EXCL_STOP