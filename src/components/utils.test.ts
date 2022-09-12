import tap from 'tap';
import { ConnectionFormContextValues } from './types';
import { mergeCloudProviderConfig } from './utils';

const config: ConnectionFormContextValues = {
  username: 'my-username',
  password: 'my-password',
  vcenter: 'https://1.2.3.4/something',
  datacenter: 'my-datacenter',
  defaultdatastore: 'my-default-ds',
  folder: '/my/folder',
};

tap.test('mergeCloudProviderConfig - empty', (t) => {
  const result = mergeCloudProviderConfig('', config);
  console.log('-- result: result');
  t.matchSnapshot(result);
  t.end();
});
