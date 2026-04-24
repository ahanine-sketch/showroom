const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const appDir = path.join(__dirname, 'showroom_iq', 'src', 'app');

walk(appDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("'use client'") || content.includes('"use client"')) {
      // Remove any existing use client directives (and their following newlines)
      let newContent = content.replace(/^['"]use client['"];?\s*/m, '');
      // Add it back at the very top
      newContent = "'use client';\n\n" + newContent;
      
      // If we made a change (other than just adding it if it was already there but maybe not at the top), write it back
      if (content !== newContent) {
        console.log(`Fixed: ${filePath}`);
        fs.writeFileSync(filePath, newContent);
      }
    }
  }
});
