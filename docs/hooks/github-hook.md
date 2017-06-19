# Github hook

[Github](https://github.com/) is a Git repository hosting service. The Github [hooks](concepts#hooks) allows 

> **This hook is not yet implemented!**
>
> Want to help? See https://github.com/stencila/sibyl/issues
>
> [Why are there unimplemented features in the documentation?](faq#unimplemented-features-in-docs)

## Hookup

1. Sign in to [Github](github.com) and go to the repository you want to hook up to Sibyl

2. Click "Settings" tab

3. Click "Webhooks" in the left panel

4. Click "Add webhook" button

5. Type `https://via.stenci.la/hooks/github` in the "Payload URL" box

6. Select `application/json` as the "Content type"

7. Select "Just the push event." in the "Which events would you like to trigger this webhook?" section.

9. Click "Add webhook" button

The form should look something like this before you click the "Add webhook" button:

![](assets/github-hook.png)

## Unhook

1. Sign in to [Github](github.com) and go to the repository you want to unhook from Sibyl

2. Click "Settings" tab

3. Click "Webhooks" in the left panel

4. Click "Delete" button next to the Webhook starting `https://via.stenci.la/...`
