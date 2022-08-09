import * as React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Alert,
  AlertVariant,
  AlertActionLink,
} from '@patternfly/react-core';

import { HealthState, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { useConnectionFormContext } from './ConnectionFormContext';
import { InProgress } from './InProgress';
import { useTranslation } from '../i18n';
import { verifyConnection } from './verifyConnection';
import { persist } from './persist';
import { VSphereConnectionProps } from './types';
import { VSphereConnectionForm } from './VSphereConnectionForm';

export const VSphereConnectionModal: React.FC<VSphereConnectionProps> = (params) => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = React.useState(true);

  const [SecretModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'Secret' });
  const [ConfigMapModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'ConfigMap' });
  const [StorageClassModel] = useK8sModel({
    group: 'storage.k8s.io',
    version: 'v1',
    kind: 'StorageClass',
  });
  const [PVCModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'PersistentVolumeClaim' });

  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const { vcenter, username, password, datacenter, defaultdatastore, folder } =
    useConnectionFormContext();

  const formId = 'vsphere-connection-modal-form';

  const onClose = () => {
    // TODO: abort potentially ongoing persistence

    setModalOpen(false);

    // hide popup
    params.hide && params.hide();
  };

  const onSave = () => {
    setIsSaving(true);
    const doItAsync = async () => {
      setError('');

      let errorMsg = await persist(
        t,
        { SecretModel, ConfigMapModel },
        {
          vcenter,
          username,
          password,
          datacenter,
          defaultdatastore,
          folder,
        },
      );

      if (errorMsg) {
        setError(errorMsg);
        setIsSaving(false);
        return;
      }

      console.log('vSphere configuration persisted well, starting monitoring.');

      errorMsg = await verifyConnection(t, { StorageClassModel, PVCModel }, { defaultdatastore });
      if (errorMsg) {
        setError(errorMsg);
        setIsSaving(false);
        return;
      }

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
        isSaving ? (
          <InProgress
            key="progress"
            text={t('Verifying configuration')}
            infoText={t(
              'New configuration might take long to take effect, all nodes need to be updated prior creating a test PVC to get bound. Please wait or watch the vSphere status for changes in several minutes.',
            )}
          />
        ) : null,
      ]}
    >
      <VSphereConnectionForm {...params} formId={formId} />

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
    </Modal>
  );
};