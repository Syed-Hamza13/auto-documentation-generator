const fs = require('fs').promises;
const path = require('path');

async function cleanupOldRepos(daysOld = 7) {
  try {
    const reposPath = process.env.REPOS_STORAGE_PATH;
    const folders = await fs.readdir(reposPath);
    
    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    for (const folder of folders) {
      const folderPath = path.join(reposPath, folder);
      const stats = await fs.stat(folderPath);
      
      if (stats.isDirectory() && stats.mtime < cutoffDate) {
        console.log('Deleting old folder:', folder);
        await fs.rm(folderPath, { recursive: true, force: true });
        deletedCount++;
      }
    }
    
    console.log(`Cleanup complete. Deleted ${deletedCount} old repositories.`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupOldRepos()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { cleanupOldRepos };