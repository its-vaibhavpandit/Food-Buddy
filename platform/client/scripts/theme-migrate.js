const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'src', 'app');

const replacements = [
  // Background tokens
  ['bg-cream-50/30', 'bg-[var(--color-bg)]'],
  ['bg-cream-50/20', 'bg-[var(--color-bg)]'],
  ['bg-cream-50/40', 'bg-[var(--color-bg)]'],
  ['bg-cream-50', 'bg-[var(--color-bg)]'],
  ['bg-cream-100/60', 'bg-[var(--color-surface)]'],
  ['bg-cream-100/50', 'bg-[var(--color-surface)]'],
  ['bg-cream-100/30', 'bg-[var(--color-surface)]'],
  ['bg-cream-100', 'bg-[var(--color-surface)]'],
  ['bg-white', 'bg-[var(--color-card-bg)]'],
  
  // Text tokens
  ['text-foreground', 'text-[var(--color-text-primary)]'],
  ['text-muted-foreground', 'text-[var(--color-text-secondary)]'],
  
  // Border tokens
  ['border-border', 'border-[var(--color-border-val)]'],
  
  // Hover bg
  ['hover:bg-muted', 'hover:bg-[var(--color-surface)]'],
  ['hover:bg-cream-100/60', 'hover:bg-[var(--color-surface)]'],
  
  // Loading spinners
  ['bg-cream-100 ', 'bg-[var(--color-skeleton)] '],
  ['bg-cream-100/', 'bg-[var(--color-skeleton)]/'],
];

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      files.push(...walkDir(full));
    } else if (entry.isFile() && full.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const files = walkDir(appDir);
let totalUpdated = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    totalUpdated++;
    console.log('Updated:', path.relative(appDir, file));
  }
}

console.log(`\nDone! Updated ${totalUpdated} files.`);
