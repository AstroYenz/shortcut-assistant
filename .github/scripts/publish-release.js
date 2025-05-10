/**
 * Publishes a draft release by setting draft=false
 */
module.exports = async ({ github, context, core, releaseId }) => {
  const { owner, repo } = context.repo;
  
  console.log(`Publishing release ${releaseId}`);
  
  if (!releaseId) {
    core.setFailed("Release ID is missing or undefined");
    return;
  }
  
  try {
    const result = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: releaseId,
      draft: false
    });
    
    const release = result.data;
    console.log(`Release published: ${release.html_url}`);
    
    // Set outputs for consistency, even though the workflow might not use them
    core.setOutput("release_id", release.id);
    core.setOutput("release_url", release.html_url);
    
    return release;
  } catch (error) {
    core.setFailed(`Failed to publish release: ${error.message}`);
  }
}; 
