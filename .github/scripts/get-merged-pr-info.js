/**
 * Finds the most recently merged PR and returns its information
 */
module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  
  // Find the PR that triggered the workflow run
  const pulls = await github.rest.pulls.list({
    owner: owner,
    repo: repo,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 10
  });
  
  // Find the most recently merged PR
  const mergedPR = pulls.data.find(pr => pr.merged_at !== null);
  
  if (!mergedPR) {
    core.setFailed('No recently merged PR found');
    return null;
  }
  
  console.log(`Found merged PR: #${mergedPR.number}, title: ${mergedPR.title}`);
  
  const result = {
    title: mergedPR.title,
    body: mergedPR.body,
    number: mergedPR.number
  };
  
  // Set outputs
  core.setOutput('pr_title', result.title);
  core.setOutput('pr_body', result.body);
  core.setOutput('pr_number', result.number);
  
  return result;
}; 
