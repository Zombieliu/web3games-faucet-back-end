import { BaseContext } from 'koa';

import { decodeAddress } from '@polkadot/util-crypto';

export type QueryParam = string | string[] | undefined;

export const defaultPage = 1;
export const defaultPageSize = 10;

export function getPageAndSize(ctx: BaseContext): [number, number] {
  const { page: queryPage, pageSize: queryPageSize } = ctx.query;
  const page = getPage(queryPage) || defaultPage;
  const pageSize = getPageSize(queryPageSize) || defaultPageSize;
  return [page, pageSize];
}

export function getPage(page: QueryParam, value = defaultPage): number {
  return getNum(page)[0] || value;
}

export function getPageSize(pageSize: QueryParam, value = defaultPageSize): number {
  return getNum(pageSize)[0] || value;
}

export function getTimeRange(ctx: BaseContext): [number | undefined, number | undefined] {
  const { fromTime, toTime } = ctx.query;
  return [getNum(fromTime)[0], getNum(toTime)[0]];
}

export function getNumRange(ctx: BaseContext): [number | undefined, number | undefined] {
  const { fromNum, toNum } = ctx.query;
  return [getNum(fromNum)[0], getNum(toNum)[0]];
}

export function getNum(param: QueryParam): [number | undefined, boolean] {
  try {
    const numParam = getFirstParam(param);
    if (typeof numParam === 'undefined') {
      return [undefined, false];
    }

    const num = parseInt(numParam);
    return isNaN(num) || !isFinite(num) || num < 0 ? [undefined, true] : [num, true];
  } catch {
    return [undefined, true];
  }
}

export function getBoolean(param: QueryParam): [boolean | undefined, boolean] {
  const boolParam = getFirstParam(param);
  if (typeof boolParam === 'undefined') {
    return [undefined, false];
  }

  if (boolParam === 'true') {
    return [true, true];
  } else if (boolParam === 'false') {
    return [false, true];
  } else {
    return [undefined, true];
  }
}

export function getHash(param: QueryParam, escape = true): [string | undefined, boolean] {
  const hash = getFirstParam(param);
  if (hash) {
    // '0x' + H256 (32 bytes)
    if (hash.startsWith('0x') && hash.length === 2 + 32 * 2) {
      if (escape) {
        return ['\\x' + hash.slice(2), true];
      } else {
        return [hash, true];
      }
    } else {
      return [undefined, true];
    }
  } else {
    return [undefined, false];
  }
}

export function getAddressAndCheck(ctx: BaseContext): Uint8Array | undefined {
  const [address, addressExist] = getAddress(ctx.query.address);
  if (addressExist && typeof address === 'undefined') {
    ctx.body = ResponseBody.invalidParam('address');
    return undefined;
  }
  return address;
}

export function getAddress(param: QueryParam): [Uint8Array | undefined, boolean] {
  const address = getFirstParam(param);
  try {
    if (address) {
      return [decodeAddress(address), true];
    } else {
      return [undefined, false];
    }
  } catch {
    return [undefined, true];
  }
}

export function getFirstParam(param: QueryParam): string | undefined {
  return Array.isArray(param) ? param.slice()[0] : param;
}

export class ResponseBody {
  message: string;
  data: unknown;

  constructor(message: string, data: unknown) {
    this.message = message;
    this.data = data;
  }

  static success(data: unknown): ResponseBody {
    return {
      message: 'Success',
      data: data,
    };
  }

  static invalidParam(param: string): ResponseBody {
    return {
      message: `Invalid Parameters (${param})`,
      data: null,
    };
  }

  static missingParam(param: string): ResponseBody {
    return {
      message: `Missing Parameters (${param})`,
      data: null,
    };
  }

  static notFound(what: string): ResponseBody {
    return {
      message: `${what} Not Found`,
      data: null,
    };
  }

  static internalError(): ResponseBody {
    return {
      message: 'Internal Error',
      data: null,
    };
  }
}

export function isEnum<T>(enumSource: T, value: any): value is T[keyof T] {
  return Object.values(enumSource).includes(value);
}


export function postAddress(address: string | undefined): [Uint8Array | undefined, boolean] {
  // const address = getFirstParam(param);
  try {
    if (address) {
      return [decodeAddress(address), true];
    } else {
      return [undefined, false];
    }
  } catch {
    return [undefined, true];
  }
}
