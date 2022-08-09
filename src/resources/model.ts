import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const InfrastructureModel: K8sModel = {
  label: 'Infrastructure',
  // t('public~Infrastructure')
  labelKey: 'public~Infrastructure',
  labelPlural: 'Infrastructures',
  // t('public~Infrastructures')
  labelPluralKey: 'public~Infrastructures',
  apiVersion: 'v1',
  apiGroup: 'config.openshift.io',
  plural: 'infrastructures',
  abbr: 'INF',
  namespaced: false,
  kind: 'Infrastructure',
  id: 'infrastructure',
  crd: true,
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
