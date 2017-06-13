## Unimplemented features in docs?

We're using documentation driven development (DDD) for Sibyl. For us, DDD is not about writing lengthy specification documents before doing any coding. It's about writing clear, user focused guides *before* a feature is implemented. It's like [README driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html).

The [advantages of DDD](https://youtu.be/x5rGUqRWlK8?t=178) that are most important to us are that it:

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
