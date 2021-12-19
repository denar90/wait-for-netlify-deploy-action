const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

const apiGet = async ({ path }) => {
  const apiUrl = 'https://api.netlify.com/api/v1/'
  const response = await axios.get(new URL(path, apiUrl).toString())
  return response.data
}

const getCurrentDeploy = async ({ siteId, sha }) => {
  const deploys = await apiGet({ path: `sites/${siteId}/deploys` })
  return deploys.find(
    (deploy) => deploy.commit_ref === sha && ['production', 'deploy-preview'].includes(deploy.context)
  )
}

const waitForDeploy = async ({ siteId, sha }) => {
  const currentDeploy = await getCurrentDeploy({ siteId, sha })
  if (currentDeploy) {
    if (currentDeploy.state === 'ready') {
      console.log('deploy is ready')
      return currentDeploy
    } else if (currentDeploy.state === 'failed') {
      return null
    } else {
      await new Promise((r) => setTimeout(r, 2000))
      return waitForDeploy({ siteId, sha })
    }
  } else {
    return null
  }
}

const waitForLive = async ({ siteId, sha, MAX_TIMEOUT }) => {
  const iterations = MAX_TIMEOUT / 2
  let currentDeploy = null
  for (let i = 0; i < iterations; i++) {
    try {
      currentDeploy = await getCurrentDeploy({ siteId, sha })
      if (currentDeploy) {
        break
      } else {
        await new Promise((r) => setTimeout(r, 2000))
      }
    } catch (e) {
      console.log(e)
      core.setFailed('Wait for Netlify failed')
      return
    }
  }

  if (!currentDeploy) {
    core.setFailed(`Can't find Netlify related to commit: ${sha}`)
  }

  currentDeploy = await waitForDeploy({ siteId, sha })
  if (currentDeploy) {
    let url = currentDeploy.deploy_ssl_url
    // compose permalink URL without Netlify Preview drawer
    if (currentDeploy.context === 'deploy-preview') {
      url = `https://${currentDeploy.id}--${currentDeploy.name}.netlify.app`
    }
    core.setOutput('url', url)
  } else {
    core.setFailed('Netlify deploy error')
  }
}

const run = async () => {
  try {
    const siteId = core.getInput('site_id')
    const MAX_TIMEOUT = Number(core.getInput('max_timeout')) || 120

    if (!siteId) {
      core.setFailed('Required field `siteId` was not provided')
    }

    const sha = github.context.payload.pull_request
      ? github.context.payload.pull_request.head.sha
      : github.context.payload.head_commit.id
    await waitForLive({ MAX_TIMEOUT, siteId, sha })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
