all: setup lint cover build


setup:
	npm install

lint:
	npm run lint

test:
	npm test
.PHONY: test

test-deps:
	npm run test-deps

cover:
	npm run cover

build:
	npm run build
.PHONY: build
