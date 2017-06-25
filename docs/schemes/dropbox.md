# dropbox://

[Dropbox](dropbox.com) is a popular file hosting service. The `dropbox://` scheme allows you to fetch files from a shared Dropbox folder.

## Setup

To share a folder on Dropbox:

1. In the folder's view click "Share folder", you should get a dialog like this:

![](assets/dropbox-scheme.png)

2. Click "Create a link"

3. Click "Copy link" which will copy a link like `https://www.dropbox.com/sh/y5hy8uu0c8lilxu/AAASyzQjyIIyMSV9B66L2Mz-a?dl=0` to your clipboard. The `y5hy8uu0c8lilxu/AAASyzQjyIIyMSV9B66L2Mz-a` part of the link is the `id` of the shared folder.

## Browser

To launch a Dropbox hosted bundle using https://open.stenci.la either use the following URL pattern:

```sh
https://open.stenci.la/dropbox://{id}
```

e.g.

```sh
https://open.stenci.la/dropbox://y5hy8uu0c8lilxu/AAASyzQjyIIyMSV9B66L2Mz-a
```

Or, select the Dropbox icon and type in, or paste, the `id` into the address box.

## Terminal

To launch a Dropbox hosted bundle in the terminal:

```sh
sibyl launch dropbox://{id}
```

e.g.

```sh
sibyl launch dropbox://y5hy8uu0c8lilxu/AAASyzQjyIIyMSV9B66L2Mz-a
```

## Details

Sibyl fetches and unzips a zip file of the folder from `https://www.dropbox.com/sh/{id}?dl=1`. If you're using Sibyl locally, you'll need to have `curl` and `unzip` installed.
