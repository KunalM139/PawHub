const fs = require('fs');

const path = "d:\\Project\\PawHub\\src\\components\\listings\\listing-management.tsx";
let code = fs.readFileSync(path, 'utf8');

// Remove hover-scale class
code = code.replace(/ hover-scale/g, '');
code = code.replace(/btn-shimmer/g, 'btn-gradient');

fs.writeFileSync(path, code, 'utf8');
console.log('Successfully updated listing-management classes');
