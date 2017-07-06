FROM rocker/tidyverse

RUN Rscript -e "devtools::install_github('stencila/r@0.27.0')"

RUN useradd --create-home --shell /bin/bash guest
WORKDIR /home/guest
USER guest

RUN Rscript -e "stencila:::install()"

CMD ["Rscript", "-e", "stencila:::run('0.0.0.0', 2000)"]
