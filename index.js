const core = require('@actions/core');
const github = require('@actions/github');
const {LabelJiraIssues} = require("./label-jira-issues");

const sRepo = github.context.repo.repo;
const sOwner = github.context.repo.owner
const sVersion = github.ref;
const sAuthToken = core.getInput("github-access-token");
const environment = core.getInput("environment");

if (!sRepo) { core.error("no repository specified, aborting"); }
if (!sOwner) { core.error("no owner specified, aborting"); }
if (!sVersion) { core.error("no version specified, aborting"); }
if (!sAuthToken) { core.error("no GitHub access token specified, aborting"); }

const run = async function () {
    new LabelJiraIssues(sAuthToken, sOwner, sRepo, sVersion, environment).createReleaseNotes(sFilePath);
}

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}

