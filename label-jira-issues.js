const { Octokit } = require("@octokit/rest");

module.exports.LabelJiraIssues = class LabelJiraIssues {

    constructor(sAuthToken, sOwner, sRepo, sVersion) {
        this.owner = sOwner;
        this.repo = sRepo;
        this.version = sVersion;

        this.octokit = new Octokit({
            auth: sAuthToken,
        });
    }

    async labelJiraIssues() {
        const release = await this.getReleaseInfos(this.owner, this.repo);
        await this.updateIssues(release);
    }

    async getReleaseInfos (sOwner, sRepo) {
        const { data } = await this.octokit.request(`/repos/${sOwner}/${sRepo}/releases`);
        const oCurrentRelease = data.find(oRelease => oRelease.tag_name.includes(this.version));
        return oCurrentRelease;
    }
    async updateIssues (release) {
        const description = release.body;
        const issues = description.match(/FCA[-|\s]\d*/gi);
        console.log(`Found ${issues.length} issues`);
    }

}