const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip the logger itself
  if (filePath.includes('logger.ts')) return;

  let modified = false;

  if (content.includes('console.error(')) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    modified = true;
  }
  
  if (content.includes('console.warn(')) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    modified = true;
  }

  if (content.includes('console.log(')) {
    content = content.replace(/console\.log\(/g, 'logger.info(');
    modified = true;
  }

  if (modified && !content.includes('@/lib/logger')) {
    // Insert import after the last import statement, or at top
    const importRegex = /import .* from ['"].*['"];?\n/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = importRegex.lastIndex;
    }
    
    const importStmt = `import { logger } from "@/lib/logger";\n`;
    if (lastIndex > 0) {
      content = content.slice(0, lastIndex) + importStmt + content.slice(lastIndex);
    } else {
      // Put after "use client"; if it exists
      if (content.includes('"use client"')) {
        content = content.replace(/"use client";?\n/, '"use client";\n' + importStmt);
      } else {
        content = importStmt + content;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated', filePath);
  }
}

traverse(srcDir);
console.log('Done.');
