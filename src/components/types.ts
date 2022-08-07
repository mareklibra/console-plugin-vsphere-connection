import { SubsystemHealth } from '@openshift-console/dynamic-plugin-sdk';
import { ConfigMap } from '../resources';

export type ConnectionFormContextSetters = {
  setVcenter: (v: string) => void;
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  setDatacenter: (v: string) => void;
  setDefaultdatastore: (v: string) => void;
  setFolder: (v: string) => void;
};

export type ConnectionFormContextValues = {
  vcenter: string;
  username: string;
  password: string;
  datacenter: string;
  defaultdatastore: string;
  folder: string;
};

export type ConnectionFormContextData = ConnectionFormContextValues & ConnectionFormContextSetters;

export type VSphereConnectionProps = {
  hide: () => void;
  cloudProviderConfig?: ConfigMap;
  health: SubsystemHealth;
};
