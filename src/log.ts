import * as log4js from 'log4js';

export const log: log4js.Logger = log4js.getLogger('api-server');
log.level = 'info';