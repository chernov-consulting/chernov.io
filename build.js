const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PUBLIC = path.join(__dirname, 'public');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const layout = fs.readFileSync(
  path.join(__dirname, 'views', 'layouts', 'main.handlebars'),
  'utf8'
);
const body = fs.readFileSync(
  path.join(__dirname, 'views', 'home.handlebars'),
  'utf8'
);

const html = layout.replace('{{{body}}}', body);

if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

fs.writeFileSync(path.join(DIST, 'index.html'), html);

copyDirSync(PUBLIC, DIST);

fs.writeFileSync(path.join(DIST, 'CNAME'), 'chernov.io\n');

console.log('Built static site in dist/');
