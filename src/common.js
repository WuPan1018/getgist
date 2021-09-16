"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFiles = exports.saveToken = exports.logout = exports.loadToken = void 0;
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const download_1 = __importDefault(require("download"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path_1.default.resolve(os_1.default.homedir(), '.config', 'GetGist');
const CONFIG_PATH = path_1.default.resolve(CONFIG_DIR, 'config.yaml');
function loadToken() {
    if (!fs_1.default.existsSync(CONFIG_PATH))
        return '';
    return yaml_1.default.parse(fs_1.default.readFileSync(CONFIG_PATH).toString()).token;
}
exports.loadToken = loadToken;
function logout() {
    if (!fs_1.default.existsSync(CONFIG_PATH))
        return;
    fs_1.default.rmSync(CONFIG_PATH);
}
exports.logout = logout;
function saveToken(token) {
    if (!fs_1.default.existsSync(CONFIG_DIR)) {
        fs_1.default.mkdirSync(CONFIG_DIR, {
            recursive: true,
        });
    }
    fs_1.default.writeFileSync(CONFIG_PATH, yaml_1.default.stringify({ token }), { flag: 'w' });
}
exports.saveToken = saveToken;
async function downloadFiles(gists, destination = 'GetGist') {
    const multiBar = new cli_progress_1.default.MultiBar({
        format: '|{bar}| {percentage}% || {value}/{total} || {filename}',
        clearOnComplete: false,
        hideCursor: true,
    });
    const files = [];
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
        return (0, download_1.default)(f.url, destination)
            .on('downloadProgress', p => {
            f.bar?.update(p.transferred);
        });
    }));
    setTimeout(() => {
        multiBar.stop();
    }, 500);
}
exports.downloadFiles = downloadFiles;
