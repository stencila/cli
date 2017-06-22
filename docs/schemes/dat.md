# dat://

[Dat](datproject.org) is a distributed data sharing tool. The `dat://` scheme allows you to fetch files from a Dat link that someone has shared with you.

## Setup

To share a Dat hosted bundle from the [Dat Desktop](https://github.com/datproject/dat-desktop),

1. Click on the "Share Dat" link icon to the right of the Dat you want to share, you should get a dialog like this:

![](assets/dat-scheme.png)

2. Click the "Copy to Clipboard" icon to get the Dat link e.g. `dat://ff34725120b2f3c5bd5028e4f61d14a45a22af48a7b12126d5d588becde88a93`


## Browser

To launch a Dat hosted bundle at https://via.stenci.la either use the following URL pattern:

```sh
https://via.stenci.la/dat://{link}
```

e.g.

```sh
https://via.stenci.la/dat://ff34725120b2f3c5bd5028e4f61d14a45a22af48a7b12126d5d588becde88a93
```

Or, select the Dat icon and type in, or paste, the `link` into the address box.

## Terminal

To launch a Dat hosted bundle in the terminal:

```sh
sibyl launch dat://{link}
```

e.g.

```sh
sibyl launch dat://ff34725120b2f3c5bd5028e4f61d14a45a22af48a7b12126d5d588becde88a93
```

## Details

Sibyl fetches a Dat by "cloning" it into a temporary directory using `dat clone dat://{link} {tempdir}`. If you're using Sibyl locally, you'll need to have the Dat [command line tool](https://docs.datproject.org/install#in-the-terminal) installed.
