# Contributing to base images

We welcome contributions to the library of base images! 

## Contributing a change

If you find yourself having to customize an image a lot, particularly if you need to add missing packages, chances are someone else is also having to do the same customization! That's a perfect time to contribute a change to the base image.

1. Create a fork of the [stencila/sibyl](https://github.com/stencila/sibyl) repository

2. Edit the image's `Dockerfile`. For example, add a new R package,

	```sh
	RUN Rscript -e "\
	    install.packages(strsplit(' \
	      ...
	      awesome_package
	      ...
	```

3. Build the image

	```sh
	docker build images/alpha --tag stencila/alpha
	```

3. Test that your changes worked. e.g.

	```sh
	# Run a container using the image
	docker run -it stencila/alpha bash
	# Now, inside the container, open R
	R
	# Check that the package is available
	library(awesome_package)
	```

4. Create a Pull Request!


## Contributing a new image

In some circumstances it may be better to contribute a new base image.

1. Choose a name for the image. We are currently using the names of Greek letters as a naming convention (although that means names are not descriptive, it keeps them short and consistent).

2. Create a new directory for your image under `images`

3. Write you own `Dockerfile` guided by the existing base images (currently you will need to at least install the `stencila-node` package to Sibyl can talk to the container)

4. Write a `README.md` which describes your container

5. Create a symlink to the `README.md` inside the `docs/images` folder:

	```sh
	cd docs/images
	ln -s ../../images/omega/README.md omega.md
	```

6. Add an entry in the table of contents: `docs/contents.json` e.g.

	```json
	"images": {
	  "alpha": "images/alpha.md",
	  ...
	  "omega": "images/omega.md"
	}
	```

7. Create a Pull Request!
