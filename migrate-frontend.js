const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'frontend', 'src');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(SRC_DIR);

const moveRules = [
  // Pages -> Modules
  { match: /^pages[\\/]Auth[\\/](.*)$/, replace: 'modules/auth/pages/$1' },
  { match: /^pages[\\/]Dashboard[\\/](.*)$/, replace: 'modules/dashboard/pages/$1' },
  { match: /^pages[\\/]DiseasePrediction[\\/](.*)$/, replace: 'modules/disease-prediction/pages/$1' },
  { match: /^pages[\\/]Appointments[\\/](.*)$/, replace: 'modules/appointments/pages/$1' },
  { match: /^pages[\\/]Recommendations[\\/](.*)$/, replace: 'modules/recommendations/pages/$1' },
  { match: /^pages[\\/]MedicalRecords[\\/](.*)$/, replace: 'modules/medical-records/pages/$1' },
  { match: /^pages[\\/]Profile[\\/](.*)$/, replace: 'modules/profile/pages/$1' },
  { match: /^pages[\\/]Notifications[\\/](.*)$/, replace: 'modules/notifications/pages/$1' },
  { match: /^pages[\\/]Patients[\\/](.*)$/, replace: 'modules/patients/pages/$1' },
  { match: /^pages[\\/]Telemedicine[\\/](.*)$/, replace: 'modules/telemedicine/pages/$1' },
  { match: /^pages[\\/]Wearables[\\/](.*)$/, replace: 'modules/wearables/pages/$1' },
  { match: /^pages[\\/]Settings[\\/](.*)$/, replace: 'modules/settings/pages/$1' },
  { match: /^pages[\\/]Landing[\\/](.*)$/, replace: 'modules/landing/pages/$1' },
  
  // Features -> Modules/Store
  { match: /^features[\\/]auth[\\/](.*)$/, replace: 'modules/auth/store/$1' },
  
  // Chat Widget -> Modules/AI Assistant
  { match: /^components[\\/]chat[\\/](.*)$/, replace: 'modules/ai-assistant/components/$1' },
  
  // Remaining Components -> Shared
  { match: /^components[\\/](.*)$/, replace: 'shared/components/$1' },
  
  // Layouts -> Shared
  { match: /^layouts[\\/](.*)$/, replace: 'shared/layouts/$1' },
];

// Map old absolute paths to new absolute paths (without extension, to match imports)
const fileMap = new Map();
// Keep original exact mapping for writing files
const exactFileMap = new Map();

allFiles.forEach(file => {
  const relativePath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  let newRelativePath = relativePath;
  
  for (const rule of moveRules) {
    // Regex matching
    const regex = new RegExp(rule.match);
    if (regex.test(relativePath)) {
      newRelativePath = relativePath.replace(regex, rule.replace);
      break;
    }
  }

  const oldAbs = file;
  const newAbs = path.join(SRC_DIR, newRelativePath);
  
  exactFileMap.set(oldAbs, newAbs);
  
  // Add mapping without extensions for import resolution
  const parsedOld = path.parse(oldAbs);
  const oldNoExt = path.join(parsedOld.dir, parsedOld.name).replace(/\\/g, '/');
  const newNoExt = newAbs.replace(/\\/g, '/').replace(/\.[^/.]+$/, "");
  
  fileMap.set(oldNoExt, newNoExt);
  
  // Also add mapping for index files (e.g., if importing a folder)
  if (parsedOld.name === 'index') {
    fileMap.set(parsedOld.dir.replace(/\\/g, '/'), newNoExt);
  }
});

function getNewImportPath(importingFileOldPath, importedRelativePath) {
  if (!importedRelativePath.startsWith('.')) {
    return importedRelativePath; // Third party or alias
  }

  // Resolve old absolute path of imported file
  const importingDir = path.dirname(importingFileOldPath);
  const importedAbsOldPath = path.resolve(importingDir, importedRelativePath).replace(/\\/g, '/');
  
  // Check if we have a mapping for it
  let newImportedAbsPath = null;
  
  // Try exact match without extension
  if (fileMap.has(importedAbsOldPath)) {
    newImportedAbsPath = fileMap.get(importedAbsOldPath);
  } else {
    // Try adding extensions
    const exts = ['.js', '.jsx', '.css'];
    for (const ext of exts) {
      if (fileMap.has(importedAbsOldPath + ext)) {
         // But the fileMap key does not have extension!
         // Wait, fileMap keys don't have extensions.
      }
      
      // Let's just check the exactFileMap with extensions
      for (const [oldExact, newExact] of exactFileMap.entries()) {
        const oldExactNorm = oldExact.replace(/\\/g, '/');
        if (oldExactNorm === importedAbsOldPath + ext || oldExactNorm === importedAbsOldPath + '/index' + ext) {
          newImportedAbsPath = newExact.replace(/\.[^/.]+$/, "");
          break;
        }
      }
    }
  }

  if (newImportedAbsPath) {
    // We found where the file moved to.
    const newImportingAbsPath = exactFileMap.get(importingFileOldPath).replace(/\\/g, '/');
    const newImportingDir = path.dirname(newImportingAbsPath);
    
    let newRelativePath = path.relative(newImportingDir, newImportedAbsPath).replace(/\\/g, '/');
    
    if (!newRelativePath.startsWith('.')) {
      newRelativePath = './' + newRelativePath;
    }
    
    return newRelativePath;
  }
  
  return importedRelativePath; // Fallback
}

// Ensure dir exists
function ensureDirSync(dirpath) {
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }
}

console.log("Processing files...");

for (const [oldPath, newPath] of exactFileMap.entries()) {
  let content = fs.readFileSync(oldPath, 'utf8');
  
  const ext = path.extname(oldPath);
  if (['.js', '.jsx'].includes(ext)) {
    // Replace imports
    // Regex matches: import ... from 'relative/path'; or import 'relative/path';
    const importRegex = /(from\s+['"]|import\s+['"])((\.\/|\.\.\/)[^'"]+)(['"])/g;
    
    content = content.replace(importRegex, (match, p1, p2, p3, p4) => {
      const newImport = getNewImportPath(oldPath, p2);
      return `${p1}${newImport}${p4}`;
    });
  }

  // Write to new path
  ensureDirSync(path.dirname(newPath));
  fs.writeFileSync(newPath, content);
  
  console.log(`Migrated: ${path.relative(SRC_DIR, oldPath)} -> ${path.relative(SRC_DIR, newPath)}`);
}

// Clean up old directories
const dirsToRemove = ['pages', 'features', 'components', 'layouts'];
dirsToRemove.forEach(dir => {
  const dirPath = path.join(SRC_DIR, dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Removed old directory: ${dir}`);
  }
});

console.log("Migration completed successfully!");
