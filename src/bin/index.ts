#!/usr/bin/env node
import prompts, {Choice} from 'prompts';
import { Octokit } from '@octokit/core';
import {createCommand} from "commander";
import {downloadFiles, GistRes, loadToken, logout, saveToken} from "../common";


export async function requestToken() {
  console.log('Create github token. https://github.com/settings/tokens');
  const { token } = await prompts([
    {
      name: 'token',
      type: 'text',
      message: 'Github token',
      validate: (prev: string) => Boolean(prev.trim()),
    }
  ], { onCancel: () => process.exit() });
  return token;
}

export async function getDownloadGistFiles(token: string): Promise<GistRes[]> {
  const octokit = new Octokit({ auth: token });
  const result = await octokit.request('GET /gists').catch(() => {
    console.log('not login');
    process.exit();
  });
  const choices: Choice[] = result.data.map(e => {
    const fileName = Object.keys(e.files)[0];
    return {
      title: `${[fileName, e.description].map(s => s?.trim()).filter(Boolean).join(' - ')}`,
      description: `${Object.keys(e.files).join(', ')}`,
      value: e,
    } as Choice;
  });
  return (await prompts([
    {
      name: 'value',
      message: 'Select gist',
      type: "multiselect",
      choices,
    }
  ], { onCancel: () => process.exit()})).value;
}

const commander = createCommand();
commander.name(require('../../package.json').name);
commander.version(require('../../package.json').version);

commander.command('login')
  .argument('[token]')
  .action(async (token?: string) => {
    await saveToken(token ? token : await requestToken());
    console.log('Login!');
  });

commander.command('logout').action(async () => {
  await logout();
  console.log('Logout!');
});
commander.command('get').action(async () => {
  const token = loadToken();
  if (!token) {
    console.log('Not login!');
    commander.help();
    return;
  }
  const gists = await getDownloadGistFiles(token);
  await downloadFiles(gists, (await prompts([
    { name: 'value', type: 'text', message: 'save path', initial: 'GetGist' }
  ], { onCancel: () => process.exit() })).value);
});

commander.parse(process.argv);
