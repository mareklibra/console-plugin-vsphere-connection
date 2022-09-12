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
  t.matchSnapshot(result);
  t.end();
});

tap.test('mergeCloudProviderConfig - delete old Virtual Center', (t) => {
  const result = mergeCloudProviderConfig(
    '[Global]\n[Workspace]\nfoo=bar\nfoofoo=barbar\n[VirtualCenter "https://will/be/replaced"]',
    config,
  );
  t.matchSnapshot(result);
  t.end();
});
