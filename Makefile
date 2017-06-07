all: setup build cover

setup:
	npm install
	bash kcov-install.sh
	sudo apt-get install shellcheck

build:
	cd images/sibyl-server && ./build.sh
	docker build images/alpha --tag stencila/alpha

run:
	npm start

lint:
	shellcheck *.sh && npm run lint

test:
	cd tests && bash run.sh

cover:
	cd tests && kcov --include-path=../sibyl.sh ../coverage run.sh
