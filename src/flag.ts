import { k8sGet, SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { VSPHERE_FEATURE_FLAG, VSPHERE_PLATFORM } from './constants';
import { Infrastructure, InfrastructureModel } from './resources';

export const vSphereFlagHandler = (callback: SetFeatureFlag) => {
  // eslint-disable-next-line no-console
  console.log('vSphereFlagHandler called', callback);

  const doItAsync = async () => {
    try {
      const infra = await k8sGet<Infrastructure>({
        model: InfrastructureModel,
        name: 'cluster',
      });

      if (infra?.status?.platform === VSPHERE_PLATFORM) {
        console.info('vSphere platfom detected, enabling the vSphere Connection flag');
        callback(VSPHERE_FEATURE_FLAG, true);
        return;
      }
    } catch (e) {
      console.error('Error when reading infrastructure CR: ', e);
    }

    console.log('vSphere platfom not detected.');
    callback(VSPHERE_FEATURE_FLAG, false);
  };

  doItAsync();
};
