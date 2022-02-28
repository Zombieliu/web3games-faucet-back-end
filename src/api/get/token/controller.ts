import { Context } from 'koa';
import { ResponseBody } from '../../util';
import { createConnection } from 'typeorm';
import { User } from '../../../entity/User';
import { GetToken } from './types';
// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { hexToString } from '@polkadot/util';
import * as polkadotCryptoUtils from '@polkadot/util-crypto';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex }  from '@polkadot/util';


export class HomeController {
  async gettoken(ctx: Context): Promise<void> {

    let address = ctx.request.body.address;

    const evmaddress = polkadotCryptoUtils.isEthereumAddress(address);


    const isValidAddressPolkadotAddress = () => {
      try {
        encodeAddress(
          isHex(address)
            ? hexToU8a(address)
            : decodeAddress(address),
        );

        return true;
      } catch (error) {
        return false;
      }
    };

    const ss58isValid = isValidAddressPolkadotAddress();

    // console.log(isValid);
    if (!ss58isValid && !evmaddress){
      ctx.body = ResponseBody.invalidParam(
        address,
      );
    }else{
      if (evmaddress)  {
        const addressInput = address;
        const addressPrefix = 42;
        address = polkadotCryptoUtils.evmToAddress(addressInput, addressPrefix);
      }
      const connection = await createConnection();
      const result = await connection.getRepository(User)
        .createQueryBuilder('user')
        .where('user.id = :id', { id: address })
        .getOne();
      await connection.close();

      if (result){
        ctx.body = ResponseBody.success(
          new GetToken(
                <string>result?.id,
                <string>result?.ip,
                <string>result?.country,
                <string>result?.city,
                <string>result?.update_time,
          ),
        );
      }else{
        ctx.body = ResponseBody.success(
          'NewAccount',
        );
      }
    }
  }
}
