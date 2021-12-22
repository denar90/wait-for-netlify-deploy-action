# 🐢 Wait for Netlify Deploy — A GitHub Action

<img alt="Waiting for deploy logo" title="Waiting for deploy logo" width="300" src="https://user-images.githubusercontent.com/6231516/145876778-d6c79fff-4cb9-42f1-bb73-08ed33b06ba8.png"/>

Action waiting for live site or preview branch to be deployed.
Using pure [Netlify API](https://docs.netlify.com/api/get-started/) and minimum config.

## How it works

Using your site API Id, action will poll Netlify API to get proper deploy status of the build related to the commit.
It supports any flows, like direct pushes to `main` branch or pull request flows.

You just have go to Netlify `Site Settings` menu, and find API Id:

<img alt="Screenshot of Netlify menu to find API Id" title="Screenshot of Netlify menu to find API Id" width="300" src="https://user-images.githubusercontent.com/6231516/145878940-5261aa63-181d-4459-9a5f-3ecd8cfdc3c9.png"/>

#### Live site

After pushing to master, action takes head commit, fetch Netlify deploy to related commit and check the status. After deploy is `ready` - it output URL for next action usage.

#### Preview site

Netlify has [deploy previews](https://docs.netlify.com/site-deploys/deploy-previews/). On created pull request, Netlify spins up separate deploy to allow user see their changes. Action takes pull request commit, fetches Netlify deploy and checks the status. After deploy is `ready` - it output URL (like - `https://{deployId}--modest-murdock-6e792e.netlify.app`) for next action usage.

> Action uses permalink e.g. `https://61bf94e5e73b010007ea2a05--modest-murdock-6e792e.netlify.app` instead of deploy preview URL like `https://deploy-preview-1--modest-murdock-6e792e.netlify.app`. 
Permalink has pure site deploy without any additional scripts, while deploy preview enables more collaboration using [Netlify Drawer](https://docs.netlify.com/site-deploys/deploy-previews/#collaborative-deploy-previews).

Read Netlify [docs](https://docs.netlify.com/site-deploys/overview/#definitions) about deploy deifnitions. 

## Inputs

### `site_id`

**Required** The API id of the Netlify site

### `max_timeout`

Optional — The amount of time to spend waiting on Netlify deploy to be created.

## Outputs

### `url`

Url of a site deploy related to the commit.

## How is it different from other Actions?

I was inspiered by https://github.com/JakePartusch/wait-for-netlify-action.
Hence this repo is a fork and keeps track of commits history for that action, but bringing new API and workflow.

## Recipes

### Recipe using with Lighthouse CI GitHub Action

Netlify permalink deploy has diabled crowling option. Reponse header for the site is set to `x-robots-tag: noindex` not to crowl other site deploy rather than main site. You have to consider that while configuring action, otherwise Lighouse will low down score for SEO category.  

```yml
name: Lighthouse CI for Netlify site
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: 12.x
      - name: Wait Netlify
        uses: denar90/wait-for-netlify-action@v2.0.2
        id: waitForNetlify
        with:
          site_id: "c8e5be00-c431-44a5-bb0d-a179e1dd72f9"
      - name: Set LHCI config
        shell: bash
        run: echo "::set-output name=file::${{github.event_name == 'pull_request' && 'lighthouserc-assertions-preview.json' || 'lighthouserc-assertions.json'}}"
        id: lhciConfig
      - name: Audit URLs using Lighthouse
        uses: treosh/lighthouse-ci-action@v3
        with:
          urls: |
            ${{ steps.waitForNetlify.outputs.url }}
            ${{ steps.waitForNetlify.outputs.url }}/about/
            ${{ steps.waitForNetlify.outputs.url }}/projects/
            ${{ steps.waitForNetlify.outputs.url }}/project/nested/lunar-eclipse
            ${{ steps.waitForNetlify.outputs.url }}/project/mars-rover
          configPath: '.github/lighthouse/${{ steps.lhciConfig.outputs.file }}'
          uploadArtifacts: true # save results as an action artifacts
          temporaryPublicStorage: true # upload lighthouse report to the temporary storage
```
