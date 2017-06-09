all: setup build cover

setup:
	npm install
	bash kcov-install.sh
	sudo apt-get install shellcheck

build:
	docker build images/alpha --tag stencila/alpha
	docker build images/iota --tag stencila/iota

push:
	docker push stencila/alpha
    docker push stencila/iota

run:
	npm start

lint:
	shellcheck *.sh && npm run lint

test:
	cd tests && bash run.sh

cover:
	cd tests && kcov --include-path=../sibyl.sh ../coverage run.sh

deploy:
	cd deploy/sibyl-server && ./build.sh
	kubectl apply -f deploy
.PHONY: deploy
