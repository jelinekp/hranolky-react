#!/usr/bin/env node
/**
 * FTP Deploy Script
 * Uploads dist/index.html and dist/assets/* files to FTP server
 * 
 * Usage:
 *   node deploy-ftp.js
 *   node deploy-ftp.js --password YOUR_PASSWORD
 *   npm run deploy
 */

import ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FTP Configuration
const FTP_CONFIG = {
  host: 'ftp4.webzdarma.cz',
  user: 'jelinekp.wz.cz',
  secure: false,
  port: 21
};

const REMOTE_DIR = '/app';
const LOCAL_DIST = path.join(__dirname, 'dist');
const PASSWORD_FILE = path.join(__dirname, '.ftp-password');

/**
 * Get password from various sources (command line, file, or prompt)
 */
async function getPassword() {
  // Check command line arguments
  const args = process.argv.slice(2);
  const passwordIndex = args.indexOf('--password');
  if (passwordIndex !== -1 && args[passwordIndex + 1]) {
    return args[passwordIndex + 1];
  }

  // Check saved password file
  if (fs.existsSync(PASSWORD_FILE)) {
    try {
      const savedPassword = fs.readFileSync(PASSWORD_FILE, 'utf8').trim();
      if (savedPassword) {
        console.log('📁 Using saved password from .ftp-password file');
        return savedPassword;
      }
    } catch (error) {
      console.warn('⚠️  Could not read saved password file');
    }
  }

  // Prompt for password
  return await promptPassword();
}

/**
 * Prompt user for password
 */
function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('🔐 Enter FTP password: ', (password) => {
      rl.close();

      // Ask if user wants to save password
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl2.question('💾 Save password for future deployments? (y/n): ', (answer) => {
        rl2.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          try {
            fs.writeFileSync(PASSWORD_FILE, password, { mode: 0o600 });
            console.log('✅ Password saved to .ftp-password (make sure this file is in .gitignore!)');
          } catch (error) {
            console.warn('⚠️  Could not save password:', error.message);
          }
        }

        resolve(password);
      });
    });
  });
}

/**
 * Check if build is recent (max 1 minute old)
 * Returns true if build is recent, false otherwise
 */
function isBuildRecent() {
  const indexPath = path.join(LOCAL_DIST, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return false;
  }

  const stats = fs.statSync(indexPath);
  const buildTime = stats.mtime.getTime();
  const now = Date.now();
  const ageInSeconds = (now - buildTime) / 1000;

  return ageInSeconds <= 60; // 1 minute = 60 seconds
}

/**
 * Prompt user if they want to build before deploying
 */
function promptBuild() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('⚠️  No recent build found (max 1 minute old). Run npm run build first? (y/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Check build age and prompt user if needed
 */
async function checkBuildAge() {
  if (!isBuildRecent()) {
    const shouldBuild = await promptBuild();

    if (shouldBuild) {
      console.log('\n🔨 Building project...\n');

      // Use dynamic import to run the build
      const { execSync } = await import('child_process');
      try {
        execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
        console.log('\n✅ Build complete!\n');
      } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        process.exit(1);
      }
    } else {
      console.log('\n⚠️  Proceeding with deployment without building...\n');
    }
  } else {
    console.log('✅ Recent build found (less than 1 minute old)\n');
  }
}

/**
 * Get all files to upload
 */
function getFilesToUpload() {
  const files = [];

  // Add index.html
  const indexPath = path.join(LOCAL_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    files.push({
      local: indexPath,
      remote: path.posix.join(REMOTE_DIR, 'index.html')
    });
  } else {
    throw new Error('index.html not found in dist directory. Did you run `npm run build`?');
  }

  // Add assets files (JS and CSS)
  const assetsDir = path.join(LOCAL_DIST, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);

    assetFiles.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        files.push({
          local: path.join(assetsDir, file),
          remote: path.posix.join(REMOTE_DIR, 'assets', file)
        });
      }
    });
  } else {
    console.warn('⚠️  No assets directory found');
  }

  return files;
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('🚀 Starting FTP deployment...\n');

  try {
    // Get password
    const password = await getPassword();

    // Check build age and prompt if needed
    await checkBuildAge();

    // Get files to upload
    const files = getFilesToUpload();
    console.log(`📦 Found ${files.length} files to upload:\n`);
    files.forEach(f => console.log(`   - ${path.basename(f.local)}`));
    console.log('');

    // Connect to FTP
    const client = new ftp.Client();
    client.ftp.verbose = false; // Set to true for debugging

    console.log('🔌 Connecting to FTP server...');
    await client.access({
      ...FTP_CONFIG,
      password: password
    });
    console.log('✅ Connected!\n');

    // Ensure remote directories exist
    console.log(`📁 Ensuring remote directory exists: ${REMOTE_DIR}`);
    await client.ensureDir(REMOTE_DIR);

    console.log(`📁 Ensuring remote directory exists: ${REMOTE_DIR}/assets`);
    await client.ensureDir(path.posix.join(REMOTE_DIR, 'assets'));
    console.log('');

    // Upload files
    console.log('📤 Uploading files...\n');
    for (const file of files) {
      const fileName = path.basename(file.local);
      const fileSize = fs.statSync(file.local).size;
      const fileSizeKB = (fileSize / 1024).toFixed(2);

      console.log(`   Uploading ${fileName} (${fileSizeKB} KB)...`);
      await client.uploadFrom(file.local, file.remote);
      console.log(`   ✅ ${fileName} uploaded`);
    }

    console.log('\n🎉 Deployment complete!\n');
    console.log(`📍 Your app should be available at: http://jelinekp.cz/app/\n`);

    client.close();
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);

    if (error.code === 530) {
      console.error('   Authentication failed. Please check your password.');
      // Delete saved password if authentication failed
      if (fs.existsSync(PASSWORD_FILE)) {
        fs.unlinkSync(PASSWORD_FILE);
        console.log('   🗑️  Removed saved password file');
      }
    }

    process.exit(1);
  }
}

// Run deployment
deploy();

