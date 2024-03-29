const { Octokit } = require("@octokit/rest");
const core = require('@actions/core');
const axios = require("axios");

module.exports.LabelJiraIssues = class LabelJiraIssues {

    constructor(sAuthToken, sOwner, sRepo, sVersion, tag, jiraConfig) {
        this.owner = sOwner;
        this.repo = sRepo;
        const version = sVersion.match(/v\d*/gi);
        this.version = version[0];
        this.jiraConfig = jiraConfig;
        this.octokit = new Octokit({
            auth: sAuthToken,
        });
        this.tag = tag;
    }

    async labelJiraIssues() {
        const release = await this.getReleaseInfos(this.owner, this.repo);
        if (!release) {
            core.setFailed("no release found");
        } else {
            await this.updateIssues(release);
        }
    }

    async getReleaseInfos(sOwner, sRepo) {
        const { data } = await this.octokit.request(`/repos/${sOwner}/${sRepo}/releases`);
        const oCurrentRelease = data.find(oRelease => oRelease.tag_name.includes(this.version));
        return oCurrentRelease;
    }
    async updateIssues(release) {
        const description = release.body;
        const regex = new RegExp(`${this.jiraConfig.projectPrefix}[-|\\s]\\d*`, 'gi');
        const issues = description.match(regex);
        if (!issues) { core.info('No issues detected'); return; }
        core.info(`Found ${issues?.length} issues`);
        for (const issue of issues) {
            const issueNumber = issue.replace(/([ ])/g, '-');
            const { data } = await this.getIssue(issueNumber);
            const labels = data.fields.labels;
            labels.push(this.tag);
            const request = {
                method: 'PUT',
                url: `${this.jiraConfig.jiraUrl}/rest/api/latest/issue/${issueNumber}`,
                auth: {
                    username: this.jiraConfig.jiraUser,
                    password: this.jiraConfig.jiraPassword,
                },
                data: { fields: { labels: labels } }
            };
            try {
                await axios(request);
                core.info(`${issueNumber} updated with TAG: ${this.tag}`);
            } catch (error) {
                console.log(error);
                core.error(`${issueNumber} not updated with TAG: ${this.tag}`);
            }
        }
    }

    async getIssue(issueNumber) {
        const request = {
            method: 'GET',
            url: `${this.jiraConfig.jiraUrl}/rest/api/latest/issue/${issueNumber}?fields=labels`,
            auth: {
                username: this.jiraConfig.jiraUser,
                password: this.jiraConfig.jiraPassword,
            },
        };
        return axios(request);
    }
}