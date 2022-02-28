import * as fs from 'fs';
import * as log4js from 'log4js';

export interface Config {
    port: number;
    log: log4js.Configuration;
}

export function loadConfig(path: string): Config {
  return JSON.parse(fs.readFileSync(path).toString()) as Config;
}