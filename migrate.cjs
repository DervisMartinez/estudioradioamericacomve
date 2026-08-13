const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && file === 'page.tsx' && fullPath !== path.join('app', 'page.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        content = '"use client";\n' + content;
      }
      
      content = content.replace(/import\s+\{\s*useNavigate\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import { useRouter } from "next/navigation"');
      content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, 'const router = useRouter()');
      content = content.replace(/navigate\(/g, 'router.push(');
      content = content.replace(/import\s+\{\s*Helmet\s*\}\s+from\s+['"]react-helmet-async['"]/g, '');
      content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
      
      // Update local imports relative to original src/
      content = content.replace(/import\s+([\s\S]*?)\s+from\s+['"]\.\/([^'"]+)['"]/g, 'import $1 from "@/components/$2"');
      content = content.replace(/import\s+([\s\S]*?)\s+from\s+['"]\.\.\/([^'"]+)['"]/g, 'import $1 from "@/components/$2"');

      // Specifically fix App.css and index.css
      content = content.replace(/import\s+['"]@\/components\/App\.css['"]/g, '');
      content = content.replace(/import\s+['"]@\/components\/index\.css['"]/g, '');
      
      fs.writeFileSync(fullPath, content);
      console.log('Updated ' + fullPath);
    }
  }
}

processDir('app');
