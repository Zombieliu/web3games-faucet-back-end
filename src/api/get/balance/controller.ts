import { BaseContext } from 'koa';
import { ResponseBody } from '../../util';
import main from '../../../Substrate';
import BigNumber from 'bignumber.js';

export class HomeController {
  async get_balance(ctx: BaseContext): Promise<void> {
    const account = <string>ctx.query.account;
    BigNumber.config({ DECIMAL_PLACES: 8 });
    const result:any = new BigNumber(await main(account));
    const final_data = result.dividedBy('10000000000').toString();

    console.log(final_data);
    ctx.body = ResponseBody.success(
      final_data,
    );
  }
}
