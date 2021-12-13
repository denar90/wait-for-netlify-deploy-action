# 🐢 Wait for Netlify Deploy — A GitHub Action 

<img alt="Waiting for deploy logo" title="Waiting for deploy logo" width="300" src="https://user-images.githubusercontent.com/6231516/145876778-d6c79fff-4cb9-42f1-bb73-08ed33b06ba8.png"/>

Action waiting for live site or preview branch to be deployed.
Using pure [Netlify API](https://docs.netlify.com/api/get-started/) and minimum config.

## How it works

Using your site API Id, action will poll Netlify API to get proper deploy status of the build related to the commit.
It supports any flwors, like direct pushes to `main` branch or pull request flows. 

Just go to - `Site Settings` menu, and find API Id:

<img alt="Screenshot of Netlify menu to find API Id" title="Screenshot of Netlify menu to find API Id" width="300" src="https://user-images.githubusercontent.com/6231516/145878940-5261aa63-181d-4459-9a5f-3ecd8cfdc3c9.png"/>

#### Live site

After pushing to master, action takes head commit, fetch Netlify deploy to related commit and check the status. After deploy is `ready` - it output URL for next action usage.

#### Preview site

Netlify has [deploy previews](https://docs.netlify.com/site-deploys/deploy-previews/).
On created pull request, Netlify spins up separate deploy to allow user see their changes.
Action takes pull request commit, fetches Netlify deploy and checks the status. After deploy is `ready` - it output URL (like - `https://deploy-preview-31--modest-murdock-6e792e.netlify.ap`) for next action usage.

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
