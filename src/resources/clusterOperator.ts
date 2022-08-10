import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { StatusCondition } from './statusCondition';

export type ClusterOperatorApiVersionType = 'config.openshift.io/v1';
export const ClusterOperatorApiVersion: ClusterOperatorApiVersionType = 'config.openshift.io/v1';

export type ClusterOperatorKindType = 'ClusterOperator';
export const ClusterOperatorKind: ClusterOperatorKindType = 'ClusterOperator';

export type ClusterOperator = K8sResourceCommon & {
  status?: {
    conditions: StatusCondition[];
  };
};
