import { TFunction } from 'react-i18next';
import { k8sGet, K8sModel, k8sCreate, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import {
  ClusterOperator,
  ClusterOperatorModel,
  PersistentVolumeClaim,
  StorageClass,
  getCondition,
  OperatorStateType,
} from '../resources';
import {
  DELAY_BEFORE_POLLING_RETRY,
  MAX_RETRY_ATTEMPTS,
  MAX_RETRY_ATTEMPTS_CO,
  MAX_RETRY_ATTEMPTS_CO_QUICK,
} from '../constants';
import { delay } from './utils';
import React from 'react';

const waitForClusterOperator = async (
  name: string,
  abortSignal: React.MutableRefObject<boolean>,
  expectedState: OperatorStateType = {
    /* An undefined value would mean: I don't care */
    progressing: 'False',
    degraded: 'False',
    available: 'True',
  },
  maxPollingAttempts: number = MAX_RETRY_ATTEMPTS_CO,
): Promise<boolean> => {
  console.info('waitForClusterOperator started for: ', name);
  for (let counter = 0; counter < maxPollingAttempts; counter++) {
    try {
      console.log('Querying co: ', name);
      const operator = await k8sGet<ClusterOperator>({ model: ClusterOperatorModel, name });
      if (
        (!expectedState.progressing ||
          getCondition(operator, 'Progressing')?.status === expectedState.progressing) &&
        (!expectedState.degraded ||
          getCondition(operator, 'Degraded')?.status === expectedState.degraded) &&
        (!expectedState.available ||
          getCondition(operator, 'Available')?.status === expectedState.available)
      ) {
        // all good
        return true;
      }
    } catch (e) {
      console.error('waitForClusterOperator error: ', e);
      // do not report, keep trying
    }

    if (abortSignal.current) {
      console.log('waitForClusterOperator received abort signal');
      return false;
    }

    await delay(DELAY_BEFORE_POLLING_RETRY);
  }

  return false;
};

// This code is recently not used, replaced by showing a message instructing to wait & check operators
export const XverifyConnection = async (
  t: TFunction,
  { StorageClassModel, PVCModel }: { StorageClassModel: K8sModel; PVCModel: K8sModel },
  { defaultdatastore }: { defaultdatastore: string },
  blockOnClusterOperators: boolean,
  abortVerification: React.MutableRefObject<boolean>,
): Promise<string | undefined> => {
  console.info('Calling verifyConnection() of vSphere connection configuration');

  // In a happy flow after clean installation, no waiting for the cluster operator is needed
  if (blockOnClusterOperators) {
    // Give the kube-controller-manager time to start reconciliation
    if (
      !(await waitForClusterOperator('kube-controller-manager', abortVerification, {
        progressing: 'True' /* other statuses are not important here*/,
      }),
      MAX_RETRY_ATTEMPTS_CO_QUICK)
    ) {
      console.info(
        'The kube-controller-manager reconciliation did not start on time. It is needed to get te new vSphere configuration updated before using it.',
      );

      // do not return, it must not be an error - i.e. no significant change is done to reconcile -- TODO: verify that
    }

    // Block on having kube-controller-manager done.
    // Without that waiting, we would be using old configuration.
    console.log('Waiting on kube-controller-manager to finish node updates.');
    if (!(await waitForClusterOperator('kube-controller-manager', abortVerification))) {
      return t(
        "The kube-controller-manager did not reconcile on time, it's a prerequisite for having the vSphere connection established.",
      );
    }
  }

  if (abortVerification.current) {
    return t('Aborted');
  }

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
      if (abortVerification.current) {
        return t('Aborted');
      }
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
