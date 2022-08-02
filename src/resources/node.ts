import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Node = K8sResourceCommon & {
  status?: {
    addresses?: { type: string; address: string }[];
  };
};
