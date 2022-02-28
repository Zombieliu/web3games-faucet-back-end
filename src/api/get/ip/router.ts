import Router from '@koa/router';

import { HomeController } from './controller';

export const router = new Router();

const controller = new HomeController();

router.post('/ip', controller.ip.bind(controller));
