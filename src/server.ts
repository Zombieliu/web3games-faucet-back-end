import Application from 'koa';
import cors from '@koa/cors';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import koaBody from 'koa-body';

import { log } from './log';
import { router } from './router';
import { Config } from './config';

export class ApiServer {
  readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public async run(): Promise<void> {
    const port = this.config.port;

    const app = new Application();
    app
      .use(logger())
      .use(koaBody({
        jsonLimit: '100kb',
      }))
      .use(
        cors({
          origin: '*',
          allowMethods: ['GET', 'OPTIONS'],
          allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
          exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
          maxAge: 10,
        }),
      )
      .use(router.routes())
      .use(helmet)
      .listen(port, () => {
        log.info(`✅ The server is running at http://localhost:${port}`);
      });
  }
}
