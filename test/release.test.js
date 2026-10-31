const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'nif-generator-release-'));

try {
  // Exercise the actual packaging command, not a separate test-only file list.
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8');
  const packaging = workflow.match(/- name: Create extension package\s+run: \|\n((?: {10}[^\n]*\n|[ \t]*\n)+)/);
  assert.ok(packaging, 'release packaging step must exist');
  const source = path.join(temp, 'source');
  fs.cpSync(root, source, {
    recursive: true,
    filter: entry => !['.git', 'node_modules', 'build'].includes(path.basename(entry))
  });
  execSync(packaging[1], { cwd: source, stdio: 'pipe' });
  const installed = path.join(temp, 'installed');
  fs.mkdirSync(installed);
  execSync(`unzip -q "${path.join(source, 'extension.zip')}" -d "${installed}"`);

  const manifest = JSON.parse(fs.readFileSync(path.join(installed, 'manifest.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.strictEqual(manifest.version, pkg.version, 'release versions must match');
  const popup = fs.readFileSync(path.join(installed, manifest.action.default_popup), 'utf8');
  const context = vm.createContext({
    document: { addEventListener() {} }
  });
  // Load classic scripts in popup order, without Node's require/module globals.
  for (const [, script] of popup.matchAll(/<script src="([^"]+)"><\/script>/g)) {
    vm.runInContext(fs.readFileSync(path.join(installed, script), 'utf8'), context, { filename: script });
  }
  assert.match(vm.runInContext('IbanES.generateIbanES()', context), /^ES\d{22}$/);
  assert.match(vm.runInContext('IbanITA.generateIbanITA()', context), /^IT\d{2}[A-Z]\d{22}$/);
  console.log('✅ Release ZIP loads popup scripts and generates ES/IT IBANs');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
