# Pinning images

You can "pin" the version of the base image. This can be useful if you want to make sure that the versions of language packages and other software remains the same. In `image.txt` specify the name and version of the base image e.g.

    alpha==2017-06-14

> **This feature is not yet implemented!**
>
> Want to see this done? Create a new issue:  https://github.com/stencila/sibyl/issues/new
>
> [Why are there unimplemented features in the documentation?](faq#unimplemented-features-in-docs)


# Custom images

Include a `Dockerfile` in your bundle to customise the image. The only restriction is that it must use a Stencila image as a base e.g. 

    FROM stencila/alpha:2017-06-14

> **This feature may be removed or restricted**
>
> Allowing for arbitrary Dockerfiles is a potential security risk and requires more compute resources
