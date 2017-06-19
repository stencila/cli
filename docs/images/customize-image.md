# Customizing your bundle image

There are the several ways that you can customize the image that Sibyl builds for your document bundle. If you find yourself needing to do a lot of customization, please consider [contributing a change](contribute-image#change) to an existing base image or [contributing a new base image](contribute-image#new).

## Pin the base image

You can "pin" the version of the base image. This can be useful if you want to make sure that the versions of language packages and other software remains the same and is not affected by the daily updates to the base images. Create a new file named `image.txt` in your bundle and specify the name and version of the base image e.g.

    alpha==2017-06-14

> **This feature is not yet implemented!**
>
> Want to see this done? Create a new issue:  https://github.com/stencila/sibyl/issues/new
>
> [Why are there unimplemented features in the documentation?](faq#unimplemented-features-in-docs)


## Specify language runtimes and packages

You can customize the version, packages and package versions for each of the languages installed in the base image. For example, to specify that R should use a particular version of the `ggplot2` package you can include a `r-requires.txt` that looks like this:

    ggplot2==2.1.0

The names and formats for these _requirements_ files differ between languages. See the language sections for more details on each:

- [Node.js](node)
- [Python](python)
- [R](r)


## Build your own image

Usually, Sibyl will compile a `Dockerfile` based on the contents of your document bundle. But you can override this step by including your own `Dockerfile`. 

For Sibyl to be able to work with the image you need to use a Stencila image as a base in the `FROM` directive e.g. 

    FROM stencila/alpha:2017-06-14

Also, you shouldn't override the `EXPOSE` and `CMD` directives from the base image.

> **This feature may be removed or restricted**
>
> Allowing for arbitrary Dockerfiles is a potential security risk and requires more compute resources
