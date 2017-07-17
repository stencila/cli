# Diamonds

[![Open with Stencila](https://img.shields.io/badge/open%20with-Stencila-green.svg)](http://open.stenci.la/github://stencila/examples/diamonds)

### Introduction

This is a small example Stencila document, stored as [Markdown in a Github repository](https://github.com/stencila/examples/diamonds), which illustrates:

- using multiple languages within a single document
- passing data between languages
- using an output to display a variable
- using a inputs to create an interactive document

### Data

We analysed the [diamonds data set](http://ggplot2.tidyverse.org/reference/diamonds.html) which contains the prices, carat, colour and other attributes of almost 54,000 diamonds. This data is also available in the Github repo as a [csv file](https://github.com/stencila/examples/diamonds/data.csv). A random sample of [1000]{name=sample_size type=range min=100 max=10000 step=100} diamonds was taken from the data (using Python).

```data=call(sample_size){py}
return pandas.read_csv('data.csv').sample(sample_size)
```

### Methods

We calculated the number and mean price of diamonds in each color category: J (worst) to D (best) (using SQLite).

```summary=call(data){sqlite}
SELECT color, count(*) diamonds, round(avg(price), 2) AS price FROM data GROUP BY color
```

We then used R to perform a generalised linear model of diamond price using carat and price as explanatory variables.

```pseudo_r2=call(data){r}
model <- glm(price~carat+color, data=data)
round(1-model$deviance/model$null.deviance,2)
```

### Results

The price diamonds is related to both their carat and color (Figure 1, Table 1). The pseudo-R2 for the generalised model using the sample of data was <span data-cell="pseudo_r2"><span>.

```call(data,smoothing){r}
ggplot(data, aes(x=carat, y=price, color=color)) + 
    geom_point() + geom_smooth(span=smoothing) + 
    labs(x='Carat', y='Price', color='Color') + theme_bw()
```
**Figure 1. Relation between diamond price, carats and color. The lines are smooths with a span of** [0.2]{name=smoothing type=range min=0.1 max=1 step=0.1}


**Table 1. The number and mean price of diamonds in each color category.**
```.
summary
```
