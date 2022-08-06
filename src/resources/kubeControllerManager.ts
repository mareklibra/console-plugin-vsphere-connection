import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type KubeControllerManager = K8sResourceCommon & {
  spec?: {
    forceRedeploymentReason?: string;
  };
};

// /apis/operator.openshift.io/v1/kubecontrollermanagers/cluster'
export const KubeControllerManagerModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'operator.openshift.io',
  label: 'Kube Controller Manager',
  labelPlural: 'Kube Controller Managers',
  plural: 'kubecontrollermanagers',
  kind: 'KubeControllerManager',
  id: 'kubecontrollermanager',
  crd: true,
  abbr: '',
};
