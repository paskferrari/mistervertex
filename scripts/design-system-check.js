/*
  Simple design system compliance check.
  Verifies core luxury.css variables and usage across key files.
*/
const fs = require('fs');
const path = require('path');

function read(file) {
  return fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
}

function assertContains(content, needle, file, errors) {
  if (!content.includes(needle)) {
    errors.push(`Missing "${needle}" in ${file}`);
  }
}

function assertNotContains(content, needle, file, errors) {
  if (content.includes(needle)) {
    errors.push(`Found forbidden "${needle}" in ${file}`);
  }
}

function main() {
  const errors = [];

  // Check luxury.css
  const luxuryCss = read('src/styles/luxury.css');
  ['--primary-bg', '--secondary-bg', '.lux-nav', '.lux-link', '.card', '.btn-primary', '.btn-secondary', '.brand-gradient']
    .forEach(token => assertContains(luxuryCss, token, 'src/styles/luxury.css', errors));

  // Layout imports
  const layout = read('src/app/layout.tsx');
  assertContains(layout, '"../styles/luxury.css"', 'src/app/layout.tsx', errors);
  assertNotContains(layout, '"../styles/xbank-mobile.css"', 'src/app/layout.tsx', errors);
  assertContains(layout, "themeColor: '#000000'", 'src/app/layout.tsx', errors);

  // Navigation refactor
  const nav = read('src/components/Navigation.tsx');
  assertContains(nav, 'lux-nav', 'src/components/Navigation.tsx', errors);
  assertNotContains(nav, 'const palettes', 'src/components/Navigation.tsx', errors);

  // Landing page uses UI components
  const landing = read('src/app/page.tsx');
  ['Card', 'Button', 'brand-gradient'].forEach(token => assertContains(landing, token, 'src/app/page.tsx', errors));

  if (errors.length) {
    console.error('Design System Check FAILED:');
    for (const e of errors) console.error(' -', e);
    process.exit(1);
  } else {
    console.log('Design System Check PASSED: Luxury design system is integrated.');
    process.exit(0);
  }
}

main();