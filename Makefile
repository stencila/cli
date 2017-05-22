setup:
	bash kcov-install.sh

build:
	docker build images/alpha-base --tag stencila/alpha-base
	docker build images/alpha --tag stencila/alpha

test:
	bash test.sh

cover:
	kcov --exclude-pattern=test.sh coverage test.sh
