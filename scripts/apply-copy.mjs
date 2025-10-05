import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const configPath = '/home/styryl/dev/contiant/replacements_contiant_to_plumbing_agent.json';
const targetPath = path.join(projectRoot, 'src/pages/index.astro');

const raw = fs.readFileSync(targetPath, 'utf8');
const htmlStart = raw.indexOf('<!DOCTYPE');
if (htmlStart === -1) {
  throw new Error('Unable to find <!DOCTYPE> in index.astro');
}
const frontMatter = raw.slice(0, htmlStart);
const html = raw.slice(htmlStart);

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const replacements = [
  ...(config.pages?.['index.html'] ?? []),
  ...(config.pages?.['*'] ?? []),
].filter((item) => item.pattern !== item.replace);

const $ = load(html, { decodeEntities: false });

let applied = 0;

$('body, head').find('*').contents().each((_, node) => {
  if (node.type !== 'text') return;
  const parentName = node.parent?.name ?? '';
  if (parentName === 'script' || parentName === 'style') return;

  let text = node.data;
  let updatedText = text;
  for (const { pattern, replace } of replacements) {
    if (!updatedText.includes(pattern)) continue;
    updatedText = updatedText.split(pattern).join(replace);
  }
  if (updatedText !== text) {
    node.data = updatedText;
    applied += 1;
  }
});

let output = frontMatter + $.root().html();

const multiNodeTweaks = new Map([
  [
    'Tired of paying high <span data-underline="sm" class="js-text-underline">Card fees?</span>',
    'Drowning in admin between <span data-underline="sm" class="js-text-underline">jobs?</span>'
  ],
  [
    'One <span class="js-three-lines">payments</span> power grid',
    'One <span class="js-three-lines">operations</span> power grid'
  ],
  [
    'Unlock the power <span class="js-text-underline">of banking data</span>',
    'Unlock the power <span class="js-text-underline">of your conversations</span>'
  ],
  [
    'Payment <span class="js-three-lines">way</span> with',
    'A day with <span class="js-three-lines">Plumbing Agent</span> vs. without'
  ],
  [
    'Turnkey <span data-underline="sm" class="js-text-underline">API solution</span> designed to scale your business',
    'Turnkey <span data-underline="sm" class="js-text-underline">plumbing platform</span>'
  ],
  [
    'All your transactions and data in <span data-underline="sm" class="js-text-underline">one place</span>',
    'All your jobs, messages, and money in <span data-underline="sm" class="js-text-underline">one place</span>'
  ],
  [
    'Payments <span data-underline="sm" class="js-text-underline">intelligence</span>',
    'Operations <span data-underline="sm" class="js-text-underline">intelligence</span>'
  ],
  [
    'Payment <span class="js-text-circle">evolution</span> for every industry',
    'Built for every <span class="js-text-circle">plumbing workflow</span>'
  ],
  [
    'Start <span class="js-text-underline mr-4">building </span>today',
    'Start <span class="js-text-underline mr-4">today</span>'
  ]
]);

for (const [needle, replacement] of multiNodeTweaks) {
  if (output.includes(needle)) {
    output = output.split(needle).join(replacement);
    applied += 1;
  }
}

fs.writeFileSync(targetPath, output);

console.log(`Replacements applied across ${applied} text nodes/fragments.`);

const finalContent = fs.readFileSync(targetPath, 'utf8');
const stillMissing = [];
for (const { pattern, replace } of replacements) {
  if (finalContent.includes(pattern) && !multiNodeTweaks.has(pattern)) {
    stillMissing.push(pattern);
  } else if (!finalContent.includes(replace) && !multiNodeTweaks.has(pattern)) {
    stillMissing.push(pattern);
  }
}
if (stillMissing.length) {
  console.log('Patterns requiring manual follow-up:');
  for (const pattern of stillMissing) {
    console.log('-', pattern);
  }
}
