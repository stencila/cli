# http://

The `http://` scheme allows you to fetch files from somewhare on the web.

> **This scheme is not yet implemented!**
>
> Want to help get it done? See https://github.com/stencila/sibyl/issues/4
>
> [Why are there unimplemented features in the documentation?](faq#unimplemented-features-in-docs)

## Browser

To launch a web hosted bundle using https://open.stenci.la either use the following URL pattern:

```sh
https://open.stenci.la/http://...
```

e.g.

```sh
https://open.stenci.la/http://foo.com/bar
```

Or, select the HTTP icon and type in, or paste, the URL into the address box.

## Terminal

To launch a web hosted bundle in the terminal:

```sh
sibyl launch http://...
```

e.g.

```sh
sibyl launch http://http://foo.com/bar
```

## Details

Sibyl uses [`wget`](https://www.gnu.org/software/wget/) to fetch the document **and** any sibling files that it links to. Files can be linked to in three ways:

In a [directory index](https://en.wikipedia.org/wiki/Webserver_directory_index) document (`index.html`) e.g.   

```html
<body>
	<a href="document.md">document.md</a>
    <a href="requirements.txt">requirements.txt</a>
    <a href="data.csv">data.csv</a>
</body>
```

In the `<head>` element e.g. 

```html
<head>
    <link rel="requires" href="requirements.txt">
    <link rel="data" href="data.csv">
</head>
```

In the `<body>` element e.g. 

```html
<p>
    The <a href="data.csv">data</a> were collected from the MP1000 multi-polyhedral spagetti spectrometer...
</p>
```

If you're using Sibyl locally, to use this scheme you'll need to have `wget` installed.
