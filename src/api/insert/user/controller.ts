import { Context } from 'koa';
import { ResponseBody } from '../../util';
import { Connection, createConnection } from 'typeorm';
import { User } from '../../../entity/User';
import { Ip } from '../../../entity/Ip';
import * as polkadotCryptoUtils from '@polkadot/util-crypto';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import * as data from '../../../key/faucet.json';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { KeyringPair$Json } from '@polkadot/keyring/types';

const Key: KeyringPair$Json = data as unknown as KeyringPair$Json;

const get_time = 86400;

const System_account = '5GQXPhYodnaWLk4MxSsFqjCYhrZwwkbbiSU8fpDRdBU6V7bT';

async function check_ip(ctx: Context,connection: Connection,ip:string,country:string,city:string,address:string) {
  // ip check
  const ip_info_result = await connection.getRepository(Ip)
    .createQueryBuilder('ip')
    .where('ip.id = :id', { id: ip })
    .getOne();

  if (ip_info_result) {

    // get database ip info
    const data_base_country = ip_info_result?.country;
    const data_base_city = ip_info_result?.city;
    // same location info
    if (data_base_country == country && data_base_city == city) {
      // find ip
      return 3;
    }
    else{
      // no ip
      return 1;
    }
  } 
  else {
    const result = await connection.getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id: address })
      .getOne();
    if (result){
      return 2;
    }else{
      return 0;
    }
  }
}

function check_address(address: string) {
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

  // check evm address
  const evmaddress = polkadotCryptoUtils.isEthereumAddress(address);

  const ss58isValid = isValidAddressPolkadotAddress();

  if (!ss58isValid && !evmaddress) {
    return 0;
  } else {
    if (evmaddress) {
      return 1;
    }else{
      return 2;
    }
  }
}

function evm_tosub(address:string) {
  const addressInput = address;
  const addressPrefix = 42;
  address = polkadotCryptoUtils.evmToAddress(addressInput, addressPrefix);
  return address;
}


async function check_time(ctx: Context,connection: Connection,address:string) :Promise<boolean>{
  const result = await connection.getRepository(User)
    .createQueryBuilder('user')
    .where('user.id = :id', { id: address })
    .getOne();
  if (result) {
    const update_time = result.update_time;
    const end = new Date().getTime();
    const start = new Date(update_time).getTime();
    const milliseconds: any = Math.abs(end - start).toString();
    const seconds = parseInt(String(milliseconds / 1000));
    // time check
    if (seconds > get_time) {
      return true;
    } else {
      return false;
    }
  }else {
    return false;
  }
}

async function final_method(ctx:Context,connection:Connection,time_result:boolean,time:string,address:string){
  if (time_result) {
    await connection
      .createQueryBuilder()
      .update(User)
      .set({ update_time: time })
      .where('id = :id', { id: address })
      .execute();
    ctx.body = ResponseBody.success(
      'Success Get W3G',
    );
  } else {
    ctx.body = ResponseBody.invalidParam(
      'not enough time',
    );
  }
}


async function add_address(connection:Connection,address:string,ip:string,country:string,city:string,time:string){
  await connection.createQueryBuilder()
    .insert()
    .into(User)
    .values({ id: address, ip,country,city,update_time:time })
    .execute();
  await connection.createQueryBuilder()
    .insert()
    .into(Ip)
    .values({ id: ip,country,city,address })
    .execute();
  await connection.close();
}


async function send_token(ctx:Context,address:string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const value = 5000000000000000000n;
  const wsProvider = new WsProvider('wss://devnet.web3games.org');
  const api = await ApiPromise.create({ provider: wsProvider });
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  const keyring = new Keyring({ type: 'sr25519' });
  const system = keyring.createFromJson(Key);
  system.unlock('WEB3GAMES321');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { nonce } = await api.query.system.account(System_account);
  const transfer = api.tx.balances.transfer(address, value);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  await transfer.signAndSend(system, { nonce }, ({ events = [], status }) => {
    console.log('Transaction status:', status.type);
    if (status.isInBlock) {
      console.log('Included at block hash', status.asInBlock.toHex());
    } else if (status.isFinalized) {
      console.log('Finalized block hash', status.asFinalized.toHex());
      ctx.body = ResponseBody.success(
        status.asFinalized.toHex(),
      );
    }
  });
}
export class HomeController {
  async insertuser(ctx: Context): Promise<void> {


    // get front-end input
    const ip: string = ctx.request.body.ip;
    const country: string = ctx.request.body.country;
    const city: string = ctx.request.body.city;
    const address: string = ctx.request.body.address;


    //input check
    // console.log('---------',address);

    // create database connection
    const connection = await createConnection();

    // first check ip table
    const ip_result = await check_ip(ctx, connection, ip, country, city,address);

    // console.log(ip_result);
    // get time
    const time = new Date().toISOString();
    
    // new ip
    if (ip_result == 0){
      const address_result = check_address(address);
      if (address_result == 0) {
        await connection.close();
        ctx.body = ResponseBody.invalidParam(
          address,
        );
      }
      else if (address_result == 1) {
        await add_address(connection,address,ip,country,city,time);
        const sub_address = evm_tosub(address);
        await send_token(ctx,sub_address);

      }else{
        await add_address(connection,address,ip,country,city,time);
        await send_token(ctx,address);
      }
    }
    // old ip
    else if (ip_result == 1) {
      const address_result = check_address(address);
      if (address_result == 0) {
        await connection.close();
        ctx.body = ResponseBody.invalidParam(
          address,
        );
      }
      else if (address_result == 1) {
        const sub_address = evm_tosub(address);
        const time_result = await check_time(ctx, connection, sub_address);
        await final_method(ctx, connection,time_result,time,address);
        await send_token(ctx,sub_address);
        await connection.close();
      } else {
        const time_result = await check_time(ctx, connection, address);
        await final_method(ctx, connection,time_result,time,address);
        await send_token(ctx,address);
        await connection.close();
      }
    }
    // error ip
    else {
      const time_result = await check_time(ctx, connection, address);
      if (time_result){
        await final_method(ctx, connection,time_result,time,address);
        await send_token(ctx,address);
        await connection.close();
      }else{
        await connection.close();
        ctx.body = ResponseBody.invalidParam(
          'you can not get w3g ,you know why!!!!',
        );
      }
    }
  }
}
