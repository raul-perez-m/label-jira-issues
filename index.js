const core = require('@actions/core');
const github = require('@actions/github');
const {LabelJiraIssues} = require("./label-jira-issues");

const sRepo = github.context.repo.repo;
const sOwner = github.context.repo.owner
const sVersion = core.getInput("version")
const sAuthToken = core.getInput("github-access-token");
const tag = core.getInput("tag");
const jiraConfig ={
    jiraUser: core.getInput("jira-user"),
    jiraPassword: core.getInput("jira-password"),
    jiraUrl: core.getInput("jira-url"),
    projectPrefix: core.getInput("project-prefix")

}; 

console.log(`version: ${sVersion}`);
if (!sRepo) { core.error("no repository specified, aborting"); }
if (!sOwner) { core.error("no owner specified, aborting"); }
if (!sVersion) { core.error("no version specified, aborting"); }
if (!sAuthToken) { core.error("no GitHub access token specified, aborting"); }
if (!tag) { core.error("no tag specified, aborting"); }
if (!jiraConfig.jiraUser) { core.error("no jira user specified, aborting"); }
if (!jiraConfig.jiraPassword) { core.error("no jira password specified, aborting"); }
if (!jiraConfig.jiraUrl) { core.error("no jira url specified, aborting"); }
if (!jiraConfig.projectPrefix) { core.error("no project prefix specified, aborting"); }

const run = async function () {
    new LabelJiraIssues(sAuthToken, sOwner, sRepo, sVersion, tag, jiraConfig).labelJiraIssues();
}

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}

