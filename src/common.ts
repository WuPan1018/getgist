import fs from "fs";
import YAML from "yaml";
import progress, {Bar} from "cli-progress";
import download from "download";
import path from "path";
import os from "os";

const CONFIG_DIR = path.resolve(os.homedir(), '.config', 'GetGist');
const CONFIG_PATH = path.resolve(CONFIG_DIR, 'config.yaml');

export interface GistFile {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: number;
}

export interface GistRes {
  files: {
    [filename: string]: GistFile;
  }
}

export function loadToken(): string {
  if (!fs.existsSync(CONFIG_PATH)) return '';
  return YAML.parse(fs.readFileSync(CONFIG_PATH).toString()).token;
}

export function logout() {
  if (!fs.existsSync(CONFIG_PATH)) return;
  fs.rmSync(CONFIG_PATH);
}

export function saveToken(token: string) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, {
      recursive: true,
    });
  }
  fs.writeFileSync(CONFIG_PATH, YAML.stringify({ token }), { flag: 'w' });
}

export async function downloadFiles(gists: GistRes[], destination = 'GetGist') {
  const multiBar = new progress.MultiBar({
    format: '|{bar}| {percentage}% || {value}/{total} || {filename}',
    clearOnComplete: false,
    hideCursor: true,
  });
  const files: { url: string, bar: Bar | null }[] = [];
  gists.forEach(g => {
    for (const name in g.files) {
      const f = g.files[name];
      files.push({
        url: f.raw_url,
        bar: multiBar.create(f.size, 0, { filename: f.filename }),
      });
    }
  });
  await Promise.all(files.map(f => {
    return download(f.url, destination)
      .on('downloadProgress', p => {
        f.bar?.update(p.transferred);
      });
  }));
  setTimeout(() => {
    multiBar.stop();
  }, 500);
}

