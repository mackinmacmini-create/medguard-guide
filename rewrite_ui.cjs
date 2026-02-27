const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = [
  { from: /bg-\[\#0A0A0A\]\/80/g, to: 'bg-white/80 shadow-sm' },
  { from: /bg-\[\#0A0A0A\]/g, to: 'bg-slate-50' },
  { from: /border-zinc-800\/50/g, to: 'border-slate-200' },
  { from: /border-zinc-800/g, to: 'border-slate-200' },
  { from: /border-zinc-700/g, to: 'border-slate-200' },
  { from: /bg-zinc-800\/50/g, to: 'bg-slate-50' },
  { from: /bg-zinc-800\/30/g, to: 'bg-slate-50' },
  { from: /bg-zinc-800/g, to: 'bg-slate-100' },
  { from: /bg-zinc-900/g, to: 'bg-white' },
  { from: /text-zinc-100/g, to: 'text-slate-800' },
  { from: /text-zinc-200/g, to: 'text-slate-700' },
  { from: /text-zinc-300/g, to: 'text-slate-600' },
  { from: /text-zinc-400/g, to: 'text-slate-500' },
  { from: /text-zinc-500/g, to: 'text-slate-400' },
  { from: /text-zinc-600/g, to: 'text-slate-300' },
  
  // Emerald to Brand
  { from: /hover:text-emerald-500/g, to: 'hover:text-brand-600' },
  { from: /text-emerald-500/g, to: 'text-brand-600' },
  { from: /text-emerald-400/g, to: 'text-brand-700' },
  { from: /bg-emerald-600/g, to: 'bg-brand-600' },
  { from: /bg-emerald-500\/10/g, to: 'bg-brand-50' },
  { from: /bg-emerald-500\/5/g, to: 'bg-brand-50' },
  { from: /border-emerald-500\/20/g, to: 'border-brand-200' },
  { from: /border-emerald-500\/10/g, to: 'border-brand-200' },
  { from: /border-emerald-500\/30/g, to: 'border-brand-300' },
  { from: /bg-emerald-500\/20/g, to: 'bg-brand-100' },
  { from: /border-l-emerald-500/g, to: 'border-l-brand-600' },
  
  // Dark text replacements (after background is light)
  { from: /text-white/g, to: 'text-slate-900' },
  { from: /shadow-2xl/g, to: 'shadow-xl shadow-slate-200/50' },
  
  // Adjusting errors/warnings
  { from: /bg-red-500\/10/g, to: 'bg-red-50' },
  { from: /bg-red-500\/5/g, to: 'bg-red-50' },
  { from: /border-red-500\/20/g, to: 'border-red-200' },
  { from: /text-red-400/g, to: 'text-red-600' },
  { from: /text-red-300\/80/g, to: 'text-red-700' },
  { from: /bg-red-950\/20/g, to: 'bg-red-50' },
  { from: /border-red-900\/50/g, to: 'border-red-200' },
  { from: /border-l-red-600/g, to: 'border-l-red-500' },
  { from: /bg-amber-500\/5/g, to: 'bg-amber-50' },
  { from: /border-amber-500\/20/g, to: 'border-amber-200' },
  { from: /border-l-amber-600/g, to: 'border-l-amber-500' },
  { from: /text-blue-500/g, to: 'text-brand-600' },
  { from: /bg-blue-600/g, to: 'bg-brand-600' },
  { from: /text-blue-400/g, to: 'text-brand-500' },
  { from: /bg-blue-500\/5/g, to: 'bg-brand-50' },
  { from: /border-blue-500\/10/g, to: 'border-brand-100' },
  
  // General prose adjustments
  { from: /prose-invert/g, to: '' },
  
  // Loading spinner
  { from: /bg-black\/80/g, to: 'bg-slate-900/40 backdrop-blur-sm' }
];

replacements.forEach(({from, to}) => {
  content = content.replace(from, to);
});

// Fix some overlapping or problematic replacements
content = content.replace(/text-slate-900 mt-1 flex-shrink-0/g, 'text-red-500 mt-1 flex-shrink-0');
content = content.replace(/text-slate-900 flex items-center justify-center text-xs/g, 'text-white flex items-center justify-center text-xs');
content = content.replace(/w-5 h-5 text-slate-900/g, 'w-5 h-5 text-white'); // keep top left icon color right if it's white

fs.writeFileSync('src/App.tsx', content);

let convContent = fs.readFileSync('src/components/ConversionTool.tsx', 'utf-8');
replacements.forEach(({from, to}) => {
  convContent = convContent.replace(from, to);
});
fs.writeFileSync('src/components/ConversionTool.tsx', convContent);

console.log('Replacements complete');
