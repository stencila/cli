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


image-%:
	docker build images/$* --tag stencila/$*

images: image-alpha image-iota image-rho


deploy-minikube:
	eval $$(minikube docker-env) && cd deploy/sibyl-server && . ./build.sh
	kubectl apply -f deploy/minikube.yaml

update-sibyl-builder:
	kubectl scale --replicas=0 replicaset $$(kubectl get rs --sort-by '{.status.readyReplicas}' | grep sibyl-builder | tail -n1 | awk '{ print $$1}')

update-sibyl-server:
	kubectl scale --replicas=0 replicaset $$(kubectl get rs --sort-by '{.status.readyReplicas}' | grep sibyl-deployment | tail -n1 | awk '{ print $$1}')
