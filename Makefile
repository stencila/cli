all: setup build cover

setup:
	npm install
	bash kcov-install.sh
	sudo apt-get install shellcheck

build:
	docker build images/alpha --tag stencila/alpha

run:
	npm start

lint:
	shellcheck *.sh && npm run lint

test:
	bash test.sh

cover:
	kcov --exclude-pattern=test.sh coverage test.sh
