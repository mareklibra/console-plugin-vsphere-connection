import { ConfigMap } from 'src/resources';
import { ConnectionFormContextSetters } from './types';

export const initialLoad = async (
  setters: ConnectionFormContextSetters,
  cloudProviderConfig: ConfigMap,
) => {
  // parse cloudProviderConfig
  // query Secret
  // parse secret
};
