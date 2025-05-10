/**
 * Creates or updates a draft release based on the PR details
 */
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
    const result = await github.rest.repos.createRelease({
      owner,
      repo,
      tag_name: releaseTag,
      name: releaseTag,
      body: releaseNotes,
      draft: true,
    });
    draftRelease = result.data;
    console.log(`Draft release created`);
  } else {
    console.log(`Updating existing draft release`);
    const result = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: draftRelease.id,
      body: releaseNotes,
      draft: true,
    });
    draftRelease = result.data;
    console.log(`Draft release updated`);
  }
  
  console.log(`Draft release ID: ${draftRelease.id}`);
  console.log(`Draft release upload URL: ${draftRelease.upload_url}`);
  core.setOutput("upload_url", draftRelease.upload_url);
  core.setOutput("release_id", draftRelease.id);
  
  // Log the output to make debugging easier
  console.log("Setting outputs:", {
    upload_url: draftRelease.upload_url,
    release_id: draftRelease.id
  });
}; 
