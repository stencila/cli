# Install

The easiest way to use Sibyl is at http://open.stenci.la . But you might want to run it locally, particularly if your interested in contributing code.

## `sibyl.sh` Bash script

At the heart of Sibyl is the [`sibyl.sh`](https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh) Bash script. You can use it to run most of Sibyl's tasks on your local machine. Download it to somewhere on your `$PATH` and make it executable e.g. on Linux:

```sh
curl https://raw.githubusercontent.com/stencila/sibyl/master/sibyl.sh > ~/.local/bin/sibyl
chmod 755 ~/.local/bin/sibyl
```

`sibyl.sh` requires [`curl`](https://curl.haxx.se/), [`docker`](https://docs.docker.com/engine/installation/), [`jq`](https://stedolan.github.io/jq/) and `netstat` to be installed.

Use `sibyl.sh` with a task name and bundle "address" e.g. 

```sh
sibyl launch github://stencila/test`
```

or, in an existing bundle directory

```
sibyl launch
```

To get closer to a production scenario you can set up and use a local private Docker registry:

```sh
docker run --detach --net sibyl-net --name sibyl-registry --rm --publish 5000:5000 registry:2
SIBYL_REGISTRY=localhost:5000 sibyl launch
```


## `stencila-sibyl` Node.js package

The Node.js [package](https://www.npmjs.com/package/stencila-sibyl) provides a web interface to `sibyl.sh`:

```sh
npm install stencila-sibyl
```

The server requires `node` v7.6.0 or higher as well as the dependencies of `sibyl.sh` (above). The `sibyl.sh` script is installed as part of the package so you don't need to install that separately.

Start the server with `npm start` and then open browser at [`http://localhost:3000`](http://localhost:3000). When you provide the server with a bundle address (e.g. `http://localhost:3000/github://stencila/test`) it will launch a container based on that bundle, echoing progress to the browser. Then, once the container has been built and started, the browser is redirected to the bundle's "main" document running inside the container.



## `stencila/sibyl-server` Docker image

Instead of installing Sibyl locally, you can use the `stencila/sibyl-server` Docker image. The Docker daemon is not available in that image so you have to make your local daemon available to it:

```sh
# Run container bound to the local Docker daemon
docker run --detach --volume /var/run/docker.sock:/var/run/docker.sock --env TOKEN_SECRET=donttell --publish 3000:3000 stencila/sibyl-server
```

Or, if you want something that is closer to a Kubernetes deployment scenario with a Docker daemon running in it's own container, then:

```sh
# Create a network for the two containers to talk over
docker network create sibyl-net
# Run a Docker-in-Docker (`dind`) container to
docker run --detach --net sibyl-net --name sibyl-docker --rm --privileged docker:dind
# Run a Sibyl server container with DOCKER_HOST pointing to the Docker daemon running in the `dind` container
docker run --detach --net sibyl-net --name sibyl-server --rm --env DOCKER_HOST=tcp://sibyl-docker:2375 --env TOKEN_SECRET=donttell--publish 3000:3000 stencila/sibyl-server
```


## Minikube cluster

The [`deploy`](deploy) folder has configurations for deployment on a Minikube cluster. To try it out locally, install [`minikube`](https://kubernetes.io/docs/tasks/tools/install-minikube/) and [`kubectrl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/) and then:

```sh
# Start the Minikube cluster
minikube start
# Deploy Sibyl to the cluster
make deploy-minikube
```

The minikube deployment provides a Docker registry service. Docker treats registries at `localhost:5000` in a special way, ignoring any TLS requirements that are usually in place. To make this work two port forwarding commands are necessary. The first makes the registry available on your localhost:

```sh
kubectl port-forward $(kubectl get pods | grep sibyl | awk '{print $1;}') 5000:5000 &
```

The second port forward, or rather reverse proxy, makes `localhost:5000` on the minikube virtual machine bounce through to the sibyl registry:
```sh
ssh -i ~/.minikube/machines/minikube/id_rsa -f -N -R 5000:localhost:5000 docker@$(minikube ip)
```

Check the `Deployment` is ready:

```sh
kubectl get deployments

NAME               DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
sibyl              1         1         1            1           1h
```

You can then get the `sibyl-server-service` URL: 

```sh
minikube service sibyl-server --url
```

And check that it can launch a container:

```sh
curl $(minikube service sibyl-server --url)/~launch/github://octocat/spoon-knife
```

The Minikube dashboard can be useful: `minikube dashboard`.

If you're developing the Docker images you can save time (and bandwidth) by not pushing/pulling images to/from the Docker Hub registry. To do that configure your local Docker client to use one of the Docker engines running inside the Minikube cluster:

- if you're building the base images in the `images` folder, or if you're running `sibyl.sh` locally and want to build the bundle images inside the cluster, then use the Docker daemon in the `sibyl-docker` container of the `sibyl-deployment`:

```sh
export DOCKER_HOST=$(minikube service sibyl-docker --format "tcp://{{.IP}}:{{.Port}}")
unset DOCKER_TLS_VERIFY
```

- if you're building the images in the `deploy` folder e.g. `sibyl-server`, including if you are modifying any code copied into thos images e.g. `server/server.js`, then use the Docker daemon in the cluster Kubelet: 

```sh
eval $(minikube docker-env)
```
