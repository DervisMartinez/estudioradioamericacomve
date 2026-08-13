const fs = require('fs');
const path = require('path');
function removeReactRouterDom(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeReactRouterDom(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('react-router-dom')) {
         content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"]react-router-dom['"];*/g, '');
         fs.writeFileSync(fullPath, content);
         console.log('Removed react-router-dom import in ' + fullPath);
      }
    }
  }
}
removeReactRouterDom('app');
removeReactRouterDom('components');
try {
  fs.rmSync('eslint.config.js', { force: true });
  console.log('Deleted eslint.config.js');
} catch(e) {}
