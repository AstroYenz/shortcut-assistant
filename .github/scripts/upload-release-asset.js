/**
 * Uploads an asset to a GitHub release
 * Handles checking for and deleting existing assets with the same name
 */
module.exports = async ({ github, context, core, releaseId }) => {
  const fs = require('fs');
  const { owner, repo } = context.repo;
  
  console.log("DEBUG - Received releaseId:", releaseId);
  
  if (!releaseId) {
    core.setFailed("Release ID is missing or undefined");
    return;
  }
  
  const assetPath = './dist/dist.zip';
  const assetName = 'ChromeExtension.zip';
  
  console.log(`Uploading asset ${assetPath} to release ${releaseId}`);
  
  // Check if file exists
  if (!fs.existsSync(assetPath)) {
    core.setFailed(`Asset file not found: ${assetPath}`);
    return;
  }
  
  const data = fs.readFileSync(assetPath);
  
  // Delete existing asset if it exists
  try {
    const assets = await github.rest.repos.listReleaseAssets({
      owner,
      repo,
      release_id: releaseId
    });
    
    for (const asset of assets.data) {
      if (asset.name === assetName) {
        console.log(`Deleting existing asset ${asset.id}`);
        await github.rest.repos.deleteReleaseAsset({
          owner,
          repo,
          asset_id: asset.id
        });
      }
    }
  } catch (error) {
    console.log(`Error checking for existing assets: ${error.message}`);
  }
  
  // Upload new asset
  try {
    const result = await github.rest.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: releaseId,
      name: assetName,
      data,
      headers: {
        'content-type': 'application/zip',
        'content-length': fs.statSync(assetPath).size
      }
    });
    
    console.log(`Asset uploaded successfully: ${result.data.browser_download_url}`);
  } catch (error) {
    core.setFailed(`Failed to upload asset: ${error.message}`);
  }
}; 
