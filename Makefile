all: setup lint cover build


setup:
	npm install

run:
	npm start

lint:
	npm run lint

test:
	npm test

cover:
	npm run cover

build:
	npm build


docs-build:
	npm run docs-build

docs-serve:
	cd build/docs && python -m SimpleHTTPServer 4000

docs-publish:
	npm run docs-publish
