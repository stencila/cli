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

4. Make a Pull Request!


## Contributing a new image

You might want to contribute a new base image

1. Greek names

Create a symlink to the `README.md` inside the `docs/images` folder:

```sh
cd docs/images
ln -s ../../images/omega/README.md omega.md
```

Then add an entry in the table of contents: `docs/contents.json` e.g.

```json
"images": {
  "alpha": "images/alpha.md",
  ...
  "omega": "images/omega.md"
}
```