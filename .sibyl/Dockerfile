FROM stencila/iota
COPY . .
RUN curl -sL "https://deb.nodesource.com/setup_7.x" | bash \
 && apt-get install -y nodejs
RUN cat ".sibyl/node-requires.txt" | xargs npm install
