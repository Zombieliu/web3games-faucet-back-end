import Router from '@koa/router';

import { router as homeRouter } from './api/get/home/router';
import { router as tokenRouter } from './api/get/token/router';
import { router as ipRouter } from './api/get/ip/router';
import { router as useRouter } from './api/insert/user/router';

export const router = new Router();

const apiV0getRouters = [
  homeRouter,
  tokenRouter,
  ipRouter,
];

const apiV0insertRouters = [
  useRouter,
];

for (const apiRouter of apiV0getRouters) {
  router.use('/api/get', apiRouter.routes(), apiRouter.allowedMethods({ throw: true }));
}

for (const apiRouter of apiV0insertRouters) {
  router.use('/api/insert', apiRouter.routes(), apiRouter.allowedMethods({ throw: true }));
}