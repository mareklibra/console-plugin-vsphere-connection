import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Secret = K8sResourceCommon & {
  data?: string /* free form */;
};
