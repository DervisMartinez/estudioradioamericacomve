const fs = require('fs');
const path = require('path');
function fixParams(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('const { id } = useParams();')) {
     content = content.replace('const { id } = useParams();', 'const params = useParams();\n  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);');
     fs.writeFileSync(file, content);
     console.log('Fixed useParams string type in ' + file);
  }
}
fixParams('app/watch/[id]/page.tsx');
fixParams('app/program/[id]/page.tsx');
