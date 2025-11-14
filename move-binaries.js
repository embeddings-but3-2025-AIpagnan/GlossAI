import { execSync } from 'child_process';
import fs from 'fs';

const is_windows = process.platform === 'win32';
const extension = is_windows ? '.exe' : '';

const rustInfo = execSync('rustc -vV');
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
  console.error('Failed to determine platform target triple');
}
fs.renameSync(
  `build/dist/backend${extension}`,
  `build/dist/backend-${targetTriple}${extension}`
);
fs.copyFileSync(
  `bin/ollama-${is_windows ? "windows" : "linux"}${extension}`,
  `build/dist/ollama-${targetTriple}${extension}`
);