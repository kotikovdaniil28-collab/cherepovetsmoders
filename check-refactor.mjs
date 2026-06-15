import fs from 'node:fs';

const required = ['index.html', 'assets/css/app.css', 'assets/js/app.js'];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Файл не найден: ${file}`);
}
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('assets/css/app.css', 'utf8');
const js = fs.readFileSync('assets/js/app.js', 'utf8');
const inlineStyles = [...html.matchAll(/<style\b/gi)].length;
const inlineScripts = [...html.matchAll(/<script(?![^>]+src=)/gi)].length;
const cloudflare = (html + js).includes('static.cloudflareinsights.com/beacon');
const hasCssLink = html.includes('./assets/css/app.css');
const hasJsLink = html.includes('./assets/js/app.js');
const hasSupabase = html.includes('@supabase/supabase-js@2');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
console.log('\n=== CH89 v9 stable assets check ===\n');
console.log('CSS link:', hasCssLink ? 'OK' : 'MISSING');
console.log('JS link:', hasJsLink ? 'OK' : 'MISSING');
console.log('Supabase CDN:', hasSupabase ? 'OK' : 'MISSING');
console.log('Inline <style>:', inlineStyles);
console.log('Inline local <script>:', inlineScripts);
console.log('Cloudflare beacon:', cloudflare ? 'FOUND' : 'OK');
console.log('Duplicate static ids:', duplicates.length ? duplicates : 'OK');
console.log('CSS size:', css.length);
console.log('JS size:', js.length);
if (!hasCssLink || !hasJsLink || !hasSupabase || inlineStyles || inlineScripts || cloudflare) process.exit(1);
console.log('\nПроверка пройдена.');
