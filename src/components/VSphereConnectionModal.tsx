import * as React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Alert,
  AlertVariant,
  AlertActionLink,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { HealthState, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { useConnectionFormContext } from './ConnectionFormContext';
import { InProgress } from './InProgress';
import { useTranslation } from '../i18n';
import { persist } from './persist';
import { VSphereConnectionProps } from './types';
import { VSphereConnectionForm } from './VSphereConnectionForm';
import { VSphereOperatorStatuses } from './VSphereOperatorStatuses';

export const VSphereConnectionModal: React.FC<VSphereConnectionProps> = (params) => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = React.useState(true);

  const [SecretModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'Secret' });
  const [ConfigMapModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'ConfigMap' });
  // const [StorageClassModel] = useK8sModel({
  //   group: 'storage.k8s.io',
  //   version: 'v1',
  //   kind: 'StorageClass',
  // });
  // const [PVCModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'PersistentVolumeClaim' });

  const [isSaving, setIsSaving] = React.useState(false);
  // const [isPersistLong, setPersistIsLong] = React.useState(false);
  const [error, setError] = React.useState<string>();
  // const abortVerification = React.useRef<boolean>(false);

  const {
    vcenter,
    username,
    password,
    datacenter,
    defaultdatastore,
    folder,
    // isBrandNewConfiguration,
  } = useConnectionFormContext();

  const formId = 'vsphere-connection-modal-form';

  // const setIsSaving = (value: boolean) => {
  //   _setIsSaving(value);

  //   let timmer;
  //   if (value) {
  //     // start timmer
  //     timmer = setTimeout(() => {
  //       setPersistIsLong(true);
  //     }, LONG_PERSIST_TIMEOUT);
  //   } else {
  //     // clear timmer
  //     setPersistIsLong(false);
  //     clearTimeout(timmer);
  //   }
  // };

  const onClose = () => {
    // abort potentially ongoing persistence
    // abortVerification.current = true;

    setModalOpen(false);

    // hide popup
    params.hide && params.hide();
  };

  const onSave = () => {
    setIsSaving(true);
    const doItAsync = async () => {
      setError('');

      const errorMsg = await persist(
        t,
        { SecretModel, ConfigMapModel },
        {
          vcenter,
          username,
          password,
          datacenter,
          defaultdatastore,
          folder,
          // isBrandNewConfiguration,
        },
      );

      if (errorMsg) {
        setError(errorMsg);
        setIsSaving(false);
        return;
      }

      console.log('vSphere configuration persisted well.');

      // abortVerification.current = false;
      // const blockOnClusterOperators = !isBrandNewConfiguration;
      // errorMsg = await verifyConnection(
      //   t,
      //   { StorageClassModel, PVCModel },
      //   { defaultdatastore },
      //   blockOnClusterOperators,
      //   abortVerification,
      // );
      // if (errorMsg) {
      //   setError(errorMsg);
      //   setIsSaving(false);
      //   return;
      // }

      // All good now
      setIsSaving(false);

      // TODO: Maybe show green success message instead of closing the modal
      onClose();
    };

    doItAsync();
  };

  return (
    // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
    <Modal
      variant={ModalVariant.small}
      position="top"
      title={t('vSphere connection configuration')}
      // description=""
      isOpen={isModalOpen}
      onClose={onClose}
      actions={[
        <Button key="save" variant="primary" isDisabled={isSaving} onClick={onSave}>
          Save configuration
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
        isSaving ? <InProgress key="progress" text={t('Saving...')} /> : null,
      ]}
    >
      <Stack>
        <StackItem>
          {!error && !isSaving && params.health.state === HealthState.WARNING && (
            <Alert
              isInline
              title={t('vSphere Problem Detector (can be outdated)')}
              variant={AlertVariant.warning}
            >
              {params.health.message}
            </Alert>
          )}
          {error && (
            <Alert
              isInline
              title={error}
              actionLinks={<AlertActionLink onClick={onSave}>{t('Retry')}</AlertActionLink>}
              variant={AlertVariant.danger}
            />
          )}
        </StackItem>
        <StackItem>
          <VSphereConnectionForm {...params} formId={formId} />
        </StackItem>
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <VSphereOperatorStatuses />
            </StackItem>
            <StackItem>
              <Alert
                variant={AlertVariant.info}
                isInline
                title={t('Delayed propagation of configuration')}
              >
                {t(
                  'Once the configuration is saved, please check status of the operators above in approximately 30 minutes to see if provided data are correct.',
                )}
                <br />
                {t(
                  'Please note, existing resources (like bound PVCs) will not be affected by later changes.',
                )}
              </Alert>
            </StackItem>
          </Stack>
        </StackItem>
      </Stack>
    </Modal>
  );
};
