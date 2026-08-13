const fs = require('fs');
const path = require('path');
function fixDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      if (!content.includes('"use client"') && !content.includes("'use client'") && content.includes('react')) {
         content = '"use client";\n' + content;
         changed = true;
      }
      if (content.includes('react-router-dom')) {
         content = content.replace(/import\s+\{\s*useNavigate\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import { useRouter } from "next/navigation"');
         content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, 'const router = useRouter()');
         content = content.replace(/navigate\(/g, 'router.push(');
         
         content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import Link from "next/link"');
         content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
         changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + fullPath);
      }
    }
  }
}
fixDir('components');
