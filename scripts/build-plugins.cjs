const {readdirSync, readFileSync} = require('node:fs');
const {execSync} = require('node:child_process');
const path = require('node:path');

async function main() {
  console.log('Building plugins');

  const pluginsDir = path.join(__dirname, '../plugins');
  const pluginNames = readdirSync(pluginsDir);

  for (const dir of pluginNames) {
    const pluginDir = path.join(pluginsDir, dir);
    const pkg = JSON.parse(readFileSync(path.join(pluginDir, 'package.json'), 'utf8'));

    console.log('Building plugin', pkg.name, pluginDir);
    execSync(`npm ci`, {cwd: pluginDir});
    execSync(`npm run build`, {cwd: pluginDir});
  }
}

main().catch(err => {
  console.log('Failed', err);
  process.exit(1);
});
