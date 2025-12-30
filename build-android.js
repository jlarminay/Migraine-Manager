import shell from 'shelljs';
import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const versionName = pkg.version;
const versionCode = Math.floor(Date.now() / 1000);

// Load passwords
const passwords = JSON.parse(fs.readFileSync('./secure/passwords.json', 'utf-8'));
const keystoreFile = path.resolve('./secure/release-key.jks');

process.env.KEYSTORE_FILE = keystoreFile;
process.env.KEYSTORE_PASSWORD = passwords.keystorePassword;
process.env.KEY_ALIAS = 'migraine-manager';
process.env.KEY_PASSWORD = passwords.keyPassword;

// Regenerate android folder
shell.exec('npx cap sync');
shell.exec('npm run build:vue');
shell.exec('npm run build:assets');

console.log(`\nBuilding Android release bundle v${versionName} (code ${versionCode})...\n`);

// Build release bundle
shell.exec(
  [
    'cd android',
    '&&',
    'gradlew.bat bundleRelease',
    `-Pandroid.injected.signing.store.file=${process.env.KEYSTORE_FILE}`,
    `-Pandroid.injected.signing.store.password=${process.env.KEYSTORE_PASSWORD}`,
    `-Pandroid.injected.signing.key.alias=${process.env.KEY_ALIAS}`,
    `-Pandroid.injected.signing.key.password=${process.env.KEY_PASSWORD}`,
    `-Pandroid.injected.versionCode=${versionCode}`,
    `-Pandroid.injected.versionName=${versionName}`,
  ].join(' '),
);

console.log('\nAndroid release bundle built successfully!');

// Open output folder on Windows
const outputDir = path.resolve('android/app/build/outputs/bundle/release');
console.log('\nOpening folder:', outputDir);
shell.exec(`start "" "${outputDir}"`);
