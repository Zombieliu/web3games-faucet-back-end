import { Context } from 'koa';
import { ResponseBody } from '../../util';
import { createConnection } from 'typeorm';
import { Ip } from '../../../entity/Ip';
import { GetIp } from './types';


// function checkIp(ip: string){
//   const rep = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
//   if(!rep.test(ip)){
//     return false;
//   }else{
//     return true;
//   }
// }

export class HomeController {
  async ip(ctx: Context): Promise<void> {

    const ip = ctx.request.body.ip;
    
    const connection = await createConnection();
    const result = await connection.getRepository(Ip)
      .createQueryBuilder('ip')
      .where('ip.id = :id', { id: ip })
      .getOne();

    await connection.close();

    if (result){
      ctx.body = ResponseBody.success(
        new GetIp(
                <string>result?.id,
                <string>result?.country,
                <string>result?.city,
                <string>result?.address,
        ),
      );
    }else{
      ctx.body = ResponseBody.success(
        'NewAccount',
      );
    }
  }

}
