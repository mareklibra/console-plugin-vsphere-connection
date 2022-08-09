export const VSPHERE_FEATURE_FLAG = 'VSPHERECONNECTION';
export const VSPHERE_PLATFORM = 'VSphere';

export const VSPHERE_CREDS_SECRET_NAME = 'vsphere-creds';
export const VSPHERE_CREDS_SECRET_NAMESPACE = 'kube-system';

export const VSPHERE_CONFIGMAP_NAME = 'cloud-provider-config';
export const VSPHERE_CONFIGMAP_NAMESPACE = 'openshift-config';

export const KUBE_CONTROLLER_MANAGER_NAME = 'cluster';

export const MAX_RETRY_ATTEMPTS = 60;
export const DELAY_BEFORE_POLLING_RETRY = 2 * 1000; // in ms
