import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type KubeControllerManager = K8sResourceCommon & {
  spec?: {
    forceRedeploymentReason?: string;
  };
};
