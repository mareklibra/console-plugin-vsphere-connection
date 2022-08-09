import { TFunction } from 'react-i18next';
import { k8sGet, K8sModel, k8sCreate, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { PersistentVolumeClaim, StorageClass } from '../resources';
import { DELAY_BEFORE_POLLING_RETRY, MAX_RETRY_ATTEMPTS } from '../constants';
import { delay } from './utils';

export const verifyConnection = async (
  t: TFunction,
  { StorageClassModel, PVCModel }: { StorageClassModel: K8sModel; PVCModel: K8sModel },
  { defaultdatastore }: { defaultdatastore: string },
): Promise<string | undefined> => {
  console.info('Calling verifyConnection() of vSphere connection configuration');

  const scIn: StorageClass = {
    kind: 'StorageClass',
    apiVersion: 'storage.k8s.io/v1',
    metadata: {
      generateName: 'vsphere-sc-',
    },
    provisioner: 'kubernetes.io/vsphere-volume',
    parameters: {
      datastore: defaultdatastore,
      diskformat: 'thin',
    },
    reclaimPolicy: 'Delete',
    volumeBindingMode: 'Immediate',
  };

  let finalReturnMessage: string | undefined = undefined;
  let sc: StorageClass;
  let pvc: PersistentVolumeClaim | undefined = undefined;
  try {
    sc = await k8sCreate({ model: StorageClassModel, data: scIn });
  } catch (e) {
    console.error('Error when creating vSphere test StorageClass: ', e);
    return t('Failed to create test StorageClass {{name}}', { name: scIn.metadata?.name });
  }

  try {
    const pvcIn: PersistentVolumeClaim = {
      kind: 'PersistentVolumeClaim',
      apiVersion: 'v1',
      metadata: {
        generateName: 'test-pvc-',
        namespace: 'openshift-config',
        annotations: {
          'volume.beta.kubernetes.io/storage-provisioner': 'kubernetes.io/vsphere-volume',
        },
        finalizers: ['kubernetes.io/pvc-protection'],
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: '10Gi',
          },
        },
        storageClassName: sc.metadata?.name || 'for-typescript-never-ever',
        volumeMode: 'Filesystem',
      },
    };

    try {
      pvc = await k8sCreate({ model: PVCModel, data: pvcIn });
    } catch (e) {
      console.error('Error when creating vSphere test PVC: ', e);
      return t('Failed to create test PVC {{name}}', { name: pvcIn.metadata?.name });
    }

    // Objects created, watch for progress now
    for (let attempt = MAX_RETRY_ATTEMPTS; attempt > 0; attempt--) {
      await delay(DELAY_BEFORE_POLLING_RETRY);
      console.log('Polling test vSphere Connection PVC');
      try {
        const polledPvc = await k8sGet<PersistentVolumeClaim>({
          model: PVCModel,
          name: pvc.metadata?.name,
          ns: pvc.metadata?.namespace,
        });

        if (polledPvc?.status?.phase === 'Bound') {
          console.info('vSphere test connection PVC was successfuly bound.');
          // It works! All good.
          // the finally block will do the clean-up
          return undefined;
        }
      } catch (e) {
        console.error('Error when polling the test PVC: ', e);
      }
    }

    return t('The vSphere test PVC was not bound in time.');
  } finally {
    // Clean-up at any case...
    console.log('Clean-up after vSphere verifyConnection');
    try {
      await k8sDelete({ model: StorageClassModel, resource: sc });
    } catch (e) {
      console.error('Error when cleaning-up - unable to delete test StorageClass: ', e);
      finalReturnMessage = t('Failed to clean-up - unable to delete test StorageClass {{name}}', {
        name: sc.metadata?.name,
      });
      // let next steps to happen anyway
    }

    if (pvc) {
      try {
        await k8sDelete({ model: PVCModel, resource: pvc });
      } catch (e) {
        console.error('Error when cleaning-up - unable to delete test PVC: ', e);
        finalReturnMessage = t('Failed to clean-up - unable to delete test PVC {{name}}', {
          name: pvc.metadata?.name,
        });
        // let next steps to happen anyway
      }
    }
  }

  return finalReturnMessage;
};
