all: setup build cover

setup:
	bash kcov-install.sh
	sudo apt-get install shellcheck

build:
	docker build images/alpha --tag stencila/alpha

run:
	npm start

lint:
	shellcheck *.sh

test:
	bash test.sh

cover:
	kcov --exclude-pattern=test.sh coverage test.sh
