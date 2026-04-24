const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('http://localhost:3001')) {
                console.log(`Updating ${filePath}`);
                
                // Add import if not present
                if (!content.includes('import { API_BASE_URL }')) {
                    const lines = content.split('\n');
                    let insertIndex = lines.findIndex(line => !line.startsWith('"use client"') && !line.startsWith('import'));
                    if (insertIndex === -1) insertIndex = 0;
                    lines.splice(insertIndex, 0, "import { API_BASE_URL } from '@/config';");
                    content = lines.join('\n');
                }
                
                // Replace URLs
                content = content.replace(/['`]http:\/\/localhost:3001([^'`]*)['`]/g, (match, path) => {
                    return `\`\${API_BASE_URL}${path}\``;
                });
                
                fs.writeFileSync(filePath, content);
            }
        }
    });
}

walk(srcDir);
console.log('Replacement complete.');
