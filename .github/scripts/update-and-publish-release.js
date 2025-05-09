/**
 * Updates a release with the latest PR information and publishes it
 */
module.exports = async ({ github, context, core, releaseTag, releaseBody }) => {
  const { owner, repo } = context.repo;
  
  try {
    // Find existing release
    const releases = await github.rest.repos.listReleases({
      owner,
      repo,
    });
    
    const draftRelease = releases.data.find(release => release.tag_name === releaseTag && release.draft === true);
    
    if (!draftRelease) {
      core.setFailed(`No draft release found with tag ${releaseTag}`);
      return null;
    }
    
    console.log(`Found draft release: ${draftRelease.id}`);
    
    // Update release with latest PR description
    const updatedRelease = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: draftRelease.id,
      body: releaseBody,
      draft: false
    });
    
    console.log(`Release published: ${updatedRelease.data.html_url}`);
    return updatedRelease.data;
  } catch (error) {
    core.setFailed(`Failed to update or publish release: ${error.message}`);
    return null;
  }
}; 
