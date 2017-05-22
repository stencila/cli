FROM stencila/alpha-base

# Install R and any other libraries required by R packages
RUN apt-get update \
    && apt-get install -y \
        apt-transport-https \
        software-properties-common \
    && add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' \
    && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9 \
    && apt-get update \
    && apt-get install -y \
        r-base \
        r-base-dev \
        libcurl4-openssl-dev \
        libssl-dev \
        libxml2-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/

# Install R packages
RUN Rscript -e "install.packages(strsplit(' \
    assertthat \
    backports \
    base64enc \
    BH \
    bitops \
    car \
    caret \
    caTools \
    cellranger \
    checkmate \
    colorspace \
    curl \
    data.table \
    DBI \
    devtools \
    dichromat \
    digest \
    dplyr \
    e1071 \
    evaluate \
    foreach \
    forecast \
    foreign \
    formatR \
    Formula \
    gdata \
    ggplot2 \
    git2r \
    gridExtra \
    gtable \
    gtools \
    highr \
    Hmisc \
    hms \
    htmlTable \
    htmltools \
    htmlwidgets \
    httpuv \
    httr \
    iterators \
    jsonlite \
    knitr \
    labeling \
    lattice \
    latticeExtra \
    lazyeval \
    lme4 \
    lmtest \
    lubridate \
    magrittr \
    markdown \
    MASS \
    Matrix \
    MatrixModels \
    memoise \
    mime \
    minqa \
    munsell \
    mvtnorm \
    nloptr \
    openssl \
    pbkrtest \
    plyr \
    psych \
    purrr \
    quantreg \
    R6 \
    RColorBrewer \
    Rcpp \
    RcppArmadillo \
    RcppEigen \
    RCurl \
    readr \
    readxl \
    rematch \
    reshape2 \
    rmarkdown \
    rpart \
    rprojroot \
    rstudioapi \
    scales \
    shiny \
    sourcetools \
    sp \
    SparseM \
    stringi \
    stringr \
    survival \
    tibble \
    tidyr \
    tidyverse \
    viridis \
    viridisLite \
    whisker \
    withr \
    XML \
    xtable \
    yaml \
    zoo \
', ' +')[[1]][-1], lib='/usr/local/lib/R/site-library', repo='http://cran.rstudio.org/')"

# Install R packages not on CRAN
RUN Rscript -e "for(repo in strsplit(' \
    IRkernel/IRkernel \
    stencila/r \
', ' +')[[1]][-1]) devtools::install_github(repo)"

# Install Jupyter R kernel
#RUN Rscript -e "IRkernel::installspec()"
