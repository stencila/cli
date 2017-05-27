all: setup build cover

setup:
	bash kcov-install.sh
	sudo apt-get install shellcheck

build:
	docker build images/alpha --tag stencila/alpha

lint:
	shellcheck sibyl test.sh

test:
	bash test.sh

cover:
	kcov --exclude-pattern=test.sh coverage test.sh
