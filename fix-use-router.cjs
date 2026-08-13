const fs = require('fs');
const path = require('path');
function fixUseRouter(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixUseRouter(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('useRouter()') && !content.includes('useRouter } from')) {
         if (content.includes('next/navigation')) {
            content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]next\/navigation['"]/, (match, p1) => {
              return `import { ${p1.trim()}, useRouter } from 'next/navigation'`;
            });
         } else {
            content = `import { useRouter } from 'next/navigation';\n` + content;
         }
         changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Added useRouter import in ' + fullPath);
      }
    }
  }
}
fixUseRouter('app');
fixUseRouter('components');
