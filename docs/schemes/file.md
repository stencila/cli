# file://

The `file://` scheme lets you fetch a bundle from your local file system.

## Browser

To launch a bundle from you local filesystem using https://open.stenci.la, 

1. Select the file upload icon

2. Select one or more files that make up the bundle, or select a `.zip` or `.tar.gz` file of the bundle.

> **This file upload feature is not yet implemented!**
>
> Want to help? See https://github.com/stencila/sibyl/issues/6
>
> [Why are there unimplemented features in the documentation?](faq#unimplemented-features-in-docs)

## Terminal

To launch a bundle from your local file systems in the terminal:

```sh
sibyl launch file://{path-to-file}
```

Note that, at present `path-to-file` must be an sbsolute file path.

e.g.

```sh
sibyl launch file:///some/folder/
```

## Details

Sibyl fetches a Github hosted bundle by downloading and extracting the tarball from `https://github.com/{user}/{repo}/tarball/master`. If you're using Sibyl locally, you'll need to have `curl` and `tar` installed.
