const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runPythonAnalysis(repoPath) {
  const command = `cd ${process.env.PYTHON_BACKEND_PATH} && uv run src/main.py analyze --repo-path "${repoPath}"`;
  
  console.log('Running analysis:', command);
  const { stdout, stderr } = await execPromise(command);
  
  if (stderr) {
    console.error('Analysis stderr:', stderr);
  }
  
  console.log('Analysis output:', stdout);
  return stdout;
}

async function runPythonGenerate(repoPath) {
  const command = `cd ${process.env.PYTHON_BACKEND_PATH} && uv run src/main.py generate readme --repo-path "${repoPath}"`;
  
  console.log('Running generate:', command);
  const { stdout, stderr } = await execPromise(command);
  
  if (stderr) {
    console.error('Generate stderr:', stderr);
  }
  
  console.log('Generate output:', stdout);
  return stdout;
}

module.exports = {
  runPythonAnalysis,
  runPythonGenerate
};