const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

const apiGet = async ({ data, path }) => {
	const apiUrl = 'https://api.netlify.com/api/v1';
	const response = await axios.get(`${apiUrl}/${path}`, {
		body: JSON.stringify(data),
		headers: getHeaders({ token: api.accessToken })
	});

	await checkResponse({ response });

	return response;
}

const waitForLive = async ({ siteId, sha, MAX_TIMEOUT }) => {
	const iterations = MAX_TIMEOUT / 2;
	for (let i = 0; i < iterations; i++) {
		try {
			const deploys = await apiGet({ path: `/sites/${siteId}/deploys` });
			const currentDeploy = deploys.find({ commit_ref: sha });
			if (currentDeploy && ['production', 'deploy_preview'].includes(currentDeploy.context)) {
				if (currentDeploy.state === 'ready') {
					return true;
				} else if (currentDeploy.state === 'failed') {
					core.setFailed("Netlify deploy failed");
					return false;
				}
			} else {
				await new Promise((r) => setTimeout(r, 2000));
			}
		} catch (e) {
			core.setFailed("Wait for Netlify failed");
		}
	}
};

const run = async () => {
	try {
		const siteId = core.getInput("site_id");
		const MAX_TIMEOUT = Number(core.getInput("max_timeout")) || 60;

		if (!siteId) {
			core.setFailed("Required field `siteId` was not provided");
		}

		return await waitForLive({ MAX_TIMEOUT, siteId, sha: github.context.payload.head_commit });

	} catch (error) {
		core.setFailed(error.message);
	}
};

run();
