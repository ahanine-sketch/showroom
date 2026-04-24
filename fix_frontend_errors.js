const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const baseDir = path.join(__dirname, 'showroom_iq', 'src');
const targets = [path.join(baseDir, 'app'), path.join(baseDir, 'components')];

targets.forEach(dir => {
  walk(dir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix merge conflicts if they exist
      if (content.includes('<<<<<<<') && content.includes('>>>>>>>')) {
        console.log(`Conflict detected in: ${filePath}. Please resolve manually if complex.`);
      }

      // Fix "use client" position
      if (content.includes("'use client'") || content.includes('"use client"')) {
        // Remove any existing use client directives (and their following newlines)
        let newContent = content.replace(/^['"]use client['"];?\s*/m, '');
        // Add it back at the very top
        newContent = "'use client';\n\n" + newContent;
        
        if (content !== newContent) {
          console.log(`Fixed directive: ${filePath}`);
          fs.writeFileSync(filePath, newContent);
        }
      }
    }
  });
});
