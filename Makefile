all: setup build cover

setup:
	bash kcov-install.sh

build:
	docker build images/alpha-base --tag stencila/alpha-base

test:
	bash test.sh

cover:
	kcov --exclude-pattern=test.sh coverage test.sh
