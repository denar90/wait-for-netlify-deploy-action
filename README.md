# Wait for Netlify — A GitHub Action ⏱

Do you have other Github actions (Lighthouse, Cypress, etc) that depend on the Netlify Preview URL? This action will wait until the url is available before running the next task.

## Inputs

### `site_id`

**Required** The API id of the Netlify site

### `max_timeout`

Optional — The amount of time to spend waiting on Netlify. Defaults to `60` seconds
