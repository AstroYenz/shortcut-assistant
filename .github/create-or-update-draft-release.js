module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  const pr = context.payload.pull_request;
  const releaseTag = pr.title;
  const releaseNotes = pr.body;
  const releases = await github.rest.repos.listReleases({
    owner,
    repo,
  });
  let draftRelease = releases.data.find(release => release.tag_name === releaseTag && release.draft === true);
  if (!draftRelease) {
    console.log(`Creating draft release`);
    draftRelease = await github.rest.repos.createRelease({
      owner,
      repo,
      tag_name: releaseTag,
      name: releaseTag,
      body: releaseNotes,
      draft: true,
    });
    console.log(`Draft release created`);
  }
  console.log(draftRelease);
  core.setOutput("upload_url", draftRelease.upload_url);
  core.setOutput("release_id", draftRelease.id);
};
