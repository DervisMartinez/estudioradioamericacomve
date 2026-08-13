const fs = require('fs');
const path = require('path');
function fixLocalStorage(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixLocalStorage(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      // We want to wrap localStorage.setItem or localStorage.getItem in typeof window !== 'undefined'
      // But instead, we can replace localStorage.getItem('...') with (typeof window !== 'undefined' ? localStorage.getItem('...') : null)
      
      if (content.includes('localStorage.getItem(')) {
          content = content.replace(/localStorage\.getItem\((.*?)\)/g, "(typeof window !== 'undefined' ? localStorage.getItem($1) : null)");
          changed = true;
      }
      
      if (content.includes('localStorage.setItem(')) {
          content = content.replace(/localStorage\.setItem\((.*?)\)/g, "if (typeof window !== 'undefined') localStorage.setItem($1)");
          changed = true;
      }
      
      if (content.includes('localStorage.removeItem(')) {
          content = content.replace(/localStorage\.removeItem\((.*?)\)/g, "if (typeof window !== 'undefined') localStorage.removeItem($1)");
          changed = true;
      }
      
      // Some components might have `const history = JSON.parse(localStorage.getItem('history')) || [];` at top level.
      // We should check that this doesn't create invalid syntax.
      // Replacing localStorage.getItem(...) with (typeof window !== 'undefined' ? localStorage.getItem(...) : null) is valid expression.
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed localStorage in ' + fullPath);
      }
    }
  }
}
fixLocalStorage('app');
fixLocalStorage('components');
