#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const skillsPath = path.resolve(process.cwd(), 'skills.json');
if (!fs.existsSync(skillsPath)) {
  console.error('skills.json not found in project root.');
  process.exit(1);
}

const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error('Exit ' + code))));
  });
}

(async () => {
  for (const s of skills) {
    const repo = s.repo;
    const skill = s.skill;
    const args = ['skills', 'add', repo, '--skill', skill];
    console.log('\nInstalling skill:', repo + ' / ' + skill);
    try {
      // run with npx so user doesn't need global install
      await run('npx', args);
    } catch (e) {
      console.error('Failed to install', repo, skill, e.message);
    }
  }
  console.log('\nAll done.');
})();
