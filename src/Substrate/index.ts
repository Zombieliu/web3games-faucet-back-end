import { ApiPromise,WsProvider } from '@polkadot/api';

async function main (account:string) {

  // Initialise the provider to connect to the local node
  const provider = new WsProvider('wss://chain-dev.web3games.org/');
  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data: { free: previousFree } } = await api.query.system.account(account);

  const balance =  `${previousFree}`;

  return balance;

}

export default main;