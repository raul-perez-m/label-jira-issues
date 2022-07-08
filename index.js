const core = require('@actions/core');
const github = require('@actions/github');
const {LabelJiraIssues} = require("./label-jira-issues");

const sRepo = github.context.repo.repo;
const sOwner = github.context.repo.owner
const sVersion = core.getInput("version")
const sAuthToken = core.getInput("github-access-token");  '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'
const environment = core.getInput("environment");
const jiraConfig ={
    jiraUser: core.getInput("jira-user"),
    jiraPassword: core.getInput("jira-password"),
    jiraUrl: core.getInput("jira-url")
}; 

console.log(`version: ${sVersion}`);
if (!sRepo) { core.error("no repository specified, aborting"); }
if (!sOwner) { core.error("no owner specified, aborting"); }
if (!sVersion) { core.error("no version specified, aborting"); }
if (!sAuthToken) { core.error("no GitHub access token specified, aborting"); }
if (!environment) { core.error("no environment specified, aborting"); }
if (!jiraConfig.jiraUser) { core.error("no jira user specified, aborting"); }
if (!jiraConfig.jiraPassword) { core.error("no jira password specified, aborting"); }
if (!jiraConfig.jiraUrl) { core.error("no jira url specified, aborting"); }

const run = async function () {
    new LabelJiraIssues(sAuthToken, sOwner, sRepo, sVersion, environment, jiraConfig).labelJiraIssues();
}

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}

