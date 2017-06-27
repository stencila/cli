## What with the name?

The sibyls were women that the ancient Greeks believed were [oracles](https://en.wikipedia.org/wiki/Sibyl). According to legend, they were incapable of speaking mistruths. That seemed like a good metaphor for a tool designed for reproducible documents. We could have called it "Oracle" instead - but that felt a little unoriginal and old fashioned ;)

> ![Sibyl](assets/sibyl.jpg)
>
> A Delphic Sibyl from Michelangelo's Sistine Chapel fresco
> (not to be confused with [Sybil Fawlty](https://www.youtube.com/watch?v=NPtIHwbguO4) who was also an oracle)

## Are there similar projects?

There are several similar projects for Jupyter:

- [tmpnb](https://github.com/jupyter/tmpnb)
- [everware](https://github.com/everware)
- [Binder](https://github.com/binder-project/binder)

## Why not just build on these?

Sibyl has drawn inspiration and ideas from these great projects, particularly Binder. However, they all have a focus on spawning per user sessions in a single language. 

Stencila is able to run code for multiple languages within one document. Although the majority of users will write single language documents, we wanted to ensure support for multi-language computing. 

Also, the semantics of code cells in Stencila Documents and Sheets allow a purely functional approach to code execution (a.k.a ["serverless" conputing](https://en.wikipedia.org/wiki/Serverless_computing)). This means that code cells can be executed "on-the-fly" and a user doesn't need to consume compute resources when simply reading text. This will be important for publishing reproducible documents at scale.

For these reasons, it was easier and allowed for greater flexibility, to start afresh with a platform-specific solution, rather than attempt to shoehorn an alternative approach into mature code bases.

## Unimplemented features in docs?

We're using documentation driven development (DDD) for Sibyl. It's not about writing 100 page specification documents before doing any coding. It's about writing clear, user focused guides before and during development. It's like [README driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html).

The [advantages of DDD](https://youtu.be/x5rGUqRWlK8?t=178) include that it:

- establishes a shared, easily accessible vision for the project

- specifies a feature from the user's perspective, not from the programmer's

- encourages contribution and engagement of non-programmers

We could instead write user-stories and create lots of mock ups and put them in Github issues. But that approach is less coherent and less accessible, particularly to non-programmers. It also involves more duplication of effort because the user-stories eventually need to get converted into user guides.

The primary disadvantage of DDD is that is may cause confusion amongst users between features they can actually use now and features which are part of the road map. To reduce the potential for confusion we try to make it very clear which features are not implemented, and importantly, how the reader can contribute, with liberal usage of comments like this:

> **This feature is not yet implemented!**
>
> Want to see this done? Create a new issue:  https://github.com/stencila/sibyl/issues/new
>
> [Why are there unimplemented features in the documentation?](faq#unimplemented-features-in-docs)

We're not advocating DDD as an approach for all software projects it just seems right for this particular project, at this particular time.
