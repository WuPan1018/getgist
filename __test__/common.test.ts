import {downloadFiles, GistRes, loadToken, logout, saveToken} from "../src/common";
import {Octokit} from "@octokit/core";
import * as fs from "fs";
import path from "path";

describe('test common.ts', function () {
  test('test saveToken', function () {
    const testToken = 'test token';
    saveToken(testToken);
    expect(loadToken()).toBe(testToken);
  });
  test('test logout', function () {
    logout()
    expect(loadToken()).toBe("");
  });
  test('test downloadFile', async function () {
    const token = process.env.TEST_TOKEN as string;
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    saveToken(token);
    const octokit = new Octokit({ auth: token });
    const res = await octokit.request('GET /gists')
    const files = [res.data[0] as GistRes];
    expect(files[0].files.constructor).toBe(Object);
    await downloadFiles(files, './__test__/dist');
    expect(fs.readdirSync(path.resolve(__dirname, 'dist')).length).toBeGreaterThan(0);
    fs.rmdirSync(path.resolve(__dirname, 'dist'), { recursive: true });
  });
});