import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Infrastructure = K8sResourceCommon & {
  spec?: {
    cloudConfig: {
      key: string; // config
      // TODO: use following instead of hardcoding it in initialLoad
      name: string; // cloud-provider-config
    };
    platformSpec: {
      type: string; // VSphere;
    };
  };
  status?: {
    platform?: string; // VSphere
  };
};
