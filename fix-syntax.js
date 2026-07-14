const fs = require('fs');

function fixSyntax(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, content);
}

const files = [
  "src/app/(dashboard)/seller-dashboard/messages/page.tsx",
  "src/components/chat/chat-widget.tsx",
  "src/components/chat/seller-chat-layout.tsx",
  "src/components/chat/seller-chat-pane.tsx",
  "src/app/api/listings/route.ts",
  "src/app/api/products/route.ts",
  "src/app/api/reports/route.ts",
  "src/app/api/verification-request/route.ts",
];

files.forEach(fixSyntax);
console.log("Syntax fixed!");
