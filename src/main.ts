import * as log4js from 'log4js';
import { Command } from 'commander';
import { loadConfig, log, ApiServer } from '.';

async function main() {
  const program = new Command();
  program
    .version('0.0.1')
    .name('faucet backend')
    .option('-c, --config <FILE>', 'load a config to start chain backend server');
  await program.parseAsync(process.argv);

  if (typeof program.opts().config === 'string') {
    const config = loadConfig(program.opts().config);
    log4js.configure(config.log);
    log.info(config);

    const server = new ApiServer(config);
    await server.run();
  } else {
    program.help();
  }
}

main().catch(err => {
  log.error(err);
});
