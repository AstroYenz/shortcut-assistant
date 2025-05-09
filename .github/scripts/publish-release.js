/**
 * Publishes a draft release by setting draft=false
 */
module.exports = async ({ github, context, core, releaseId }) => {
  const { owner, repo } = context.repo;
  
  console.log(`Publishing release ${releaseId}`);
  
  try {
    const release = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: releaseId,
      draft: false
    });
    
    console.log(`Release published: ${release.data.html_url}`);
    return release.data;
  } catch (error) {
    core.setFailed(`Failed to publish release: ${error.message}`);
  }
}; 
