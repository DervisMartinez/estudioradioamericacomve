const fs = require('fs');
const path = require('path');
function fixUseParams(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixUseParams(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('react-router-dom')) {
        content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"]/g, (match, p1) => {
          let imports = p1.split(',').map(s => s.trim()).filter(Boolean);
          let nextNavigationImports = [];
          
          if (imports.includes('useParams')) {
            nextNavigationImports.push('useParams');
            imports = imports.filter(i => i !== 'useParams');
          }
          if (imports.includes('useLocation')) {
            nextNavigationImports.push('usePathname');
            nextNavigationImports.push('useSearchParams');
            imports = imports.filter(i => i !== 'useLocation');
            content = content.replace(/const\s+location\s*=\s*useLocation\(\)/g, 'const pathname = usePathname(); const searchParams = useSearchParams();');
            content = content.replace(/location\.pathname/g, 'pathname');
            content = content.replace(/location\.search/g, 'searchParams.toString()');
          }
          
          let result = '';
          if (nextNavigationImports.length > 0) {
            result += `import { ${nextNavigationImports.join(', ')} } from 'next/navigation';\n`;
            changed = true;
          }
          
          if (imports.length > 0) {
            result += `import { ${imports.join(', ')} } from 'react-router-dom';`;
          }
          return result;
        });
      }
      
      // also replace <Link to="..."> with <Link href="...">
      if (content.includes('Link')) {
        content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
        if (content.includes('import { Link } from \'react-router-dom\'')) {
             content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import Link from "next/link"');
             changed = true;
        } else if (content.includes('Link') && content.match(/import.*react-router-dom/)) {
            // we already replaced the block above, so maybe we need to inject next/link
            if (!content.includes('next/link')) {
                content = 'import Link from "next/link";\n' + content;
                changed = true;
            }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed router hooks in ' + fullPath);
      }
    }
  }
}
fixUseParams('app');
fixUseParams('components');
