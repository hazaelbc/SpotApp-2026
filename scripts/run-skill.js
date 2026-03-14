#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/run-skill.js <owner/repo|skill-name> <file-path> [output-name]');
  process.exit(1);
}

const skillArg = args[0];
const filePath = args[1];
const outName = args[2] || `${skillArg.replace(/[^a-z0-9_-]/gi, '_')}-${Date.now()}`;

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const input = fs.readFileSync(filePath, 'utf8');
const outDir = path.resolve(process.cwd(), 'skills-output', skillArg.replace(/[\/:]/g, '_'));
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, outName + '.txt');

function run(cmd, args, inputData) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { shell: true });
    let stdout = '';
    let stderr = '';
    if (inputData) p.stdin.write(inputData);
    if (p.stdin) p.stdin.end();
    p.stdout.on('data', (d) => { stdout += d.toString(); process.stdout.write(d); });
    p.stderr.on('data', (d) => { stderr += d.toString(); process.stderr.write(d); });
    p.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr }); else reject(new Error('Exit ' + code + '\n' + stderr));
    });
  });
}

(async () => {
  // Try common invocation patterns for the `skills` CLI
  const candidates = [
    ['npx', ['skills', 'run', skillArg, '--file', filePath]],
    ['npx', ['skills', 'run', skillArg, '--stdin']],
    ['npx', ['skills', 'run', skillArg, filePath]],
    ['npx', ['skills', 'run', skillArg]],
  ];

  for (const [cmd, cmdArgs] of candidates) {
    try {
      console.log('\n> Running:', cmd, cmdArgs.join(' '));
      const res = await run(cmd, cmdArgs, cmdArgs.includes('--stdin') ? input : null);
      fs.writeFileSync(outFile, res.stdout || res.stderr || '');
      console.log('\nSaved output to', outFile);
      return;
    } catch (e) {
      console.warn('Invocation failed:', e.message);
    }
  }

  console.error('All invocation attempts failed. Check that the `skills` CLI is available.');
  process.exit(1);
})();
