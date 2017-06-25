# alpha (α)

A comprehensive base image for data analysis in Python, R and/or Node.js

> Not the document would were expecting to see?
>
> That may be because you launched a document bundle at http://open.stenci.la (or somewhere else using [Sibyl](https://github.com/stencila/sibyl)) but your bundle did not contain a "main" document (e.g. `main.md`).
>
> Try again using a bundle with a supported [layout](https://sibyl.surge.sh), or just read on and have a play!

This image contains the Stencila packages for [Node.js](https://github.com/stencila/node), [Python](https://github.com/stencila/python) and [R](https://github.com/stencila/r) (which allows you to author documents containing code in these languages) as well as a large number of system libraries and packages for scientific computing. It aims to provide a computing environment that meets the needs of 95% of research documents.

If you are reading this within a container then you should be able to interact with the following code blocks writen in various coding languages.

### Python

```run(){py}
return 6 * 7
```

### R

```run(){r}
library(ggplot2) 
ggplot(diamonds) + geom_point(aes(x=color,y=carat))
```

### SQLite

```run(){sqlite}
SELECT 6*7 AS answer;
```

### Node

```run(){node}
return process
```
