const { Octokit } = require("@octokit/rest");
const core = require('@actions/core');
const axios = require("axios");

module.exports.LabelJiraIssues = class LabelJiraIssues {

    constructor(sAuthToken, sOwner, sRepo, sVersion, tag, jiraConfig) {
        this.owner = sOwner;
        this.repo = sRepo;
        const version = sVersion.match(/v\d*/gi);
        this.tag = version[0];
        this.jiraConfig = jiraConfig;
        this.octokit = new Octokit({
            auth: sAuthToken,
        });
        this.tag = tag;
    }

    async labelJiraIssues() {
        const release = await this.getReleaseInfos(this.owner, this.repo);

        await this.updateIssues(release);
    }

    async getReleaseInfos(sOwner, sRepo) {
        const { data } = await this.octokit.request(`/repos/${sOwner}/${sRepo}/releases`);
        const oCurrentRelease = data.find(oRelease => oRelease.tag_name.includes(this.version));
        return oCurrentRelease;
    }
    async updateIssues(release) {
        const description = release.body;
        const issues = description.match(/FCA[-|\s]\d*/gi);
        console.log(`Found ${issues.length} issues`);

        for (const issue of issues) {
            const issueNumber = issue.replace(/([ ])/g, '-');
            const request = {
                method: 'PUT',
                url: `${this.jiraConfig.jiraUrl}/rest/api/latest/issue/${issueNumber}`,
                auth: {
                    username: this.jiraConfig.jiraUser,
                    password: this.jiraConfig.jiraPassword,
                },
                data: { fields: { labels: [this.tag] } }
            };
            try {
                await axios(request);
                console.log(`${issueNumber} updated with TAG: ${this.tag}`);
            } catch (error) {
                console.log(error);
                core.error(`${issueNumber} not updated with TAG: ${this.tag}`);
            }
        }
    }

}