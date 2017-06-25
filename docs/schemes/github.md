# github://

[Github](https://github.com/) is a Git repository hosting service. The `github://` scheme lets you fetch a bundle from a Github hosted repository.

You may also be interested in the [hook for Github](github-hook).

## Browser

To launch a Github hosted bundle using https://open.stenci.la, either use the following URL pattern:

```sh
https://open.stenci.la/github://{user}/{repo}/{folder}
```

The `folder` part is optional, if you leave it off the root folder of the repository will be used.

e.g.

```sh
https://open.stenci.la/github://octocat/hello-world/
https://open.stenci.la/github://stencila/test/sub
```

Or, select the Github icon and type in, or paste, the `{user}/{repo}/{folder}` into the address box.

## Terminal

To launch a Github hosted bundle in the terminal:

```sh
sibyl launch github://{user}/{repo}/{folder}
```

e.g.

```sh
sibyl launch github://octocat/hello-world/
```

## Details

Sibyl fetches a Github hosted bundle by downloading and extracting the tarball from `https://github.com/{user}/{repo}/tarball/master`. If you're using Sibyl locally, you'll need to have the `curl` and `tar` installed.
