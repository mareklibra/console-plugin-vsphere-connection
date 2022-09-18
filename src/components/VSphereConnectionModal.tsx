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

import './VSphereConnectionModal.css';

export const VSphereConnectionModal: React.FC<VSphereConnectionProps> = (params) => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = React.useState(true);

  const [SecretModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'Secret' });
  const [ConfigMapModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'ConfigMap' });

  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const { vcenter, username, password, datacenter, defaultdatastore, folder, isDirty, setDirty } =
    useConnectionFormContext();

  const formId = 'vsphere-connection-modal-form';

  const onClose = () => {
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
        },
        params.cloudProviderConfig,
      );

      // Done
      setIsSaving(false);

      if (errorMsg) {
        setError(errorMsg);
        setIsSaving(false);
        return;
      }

      // We are all good now
      console.log('vSphere configuration persisted well.');

      setDirty(false); // Or call initialLoad() instead
      // onClose();
    };

    doItAsync();
  };

  let alert;
  if (!error && !isSaving && params.health.state === HealthState.WARNING) {
    alert = (
      <Alert
        isInline
        title={t('vSphere Problem Detector (can be outdated)')}
        variant={AlertVariant.warning}
      >
        {params.health.message}
      </Alert>
    );
  } else if (error) {
    alert = (
      <Alert
        isInline
        title={error}
        actionLinks={<AlertActionLink onClick={onSave}>{t('Retry')}</AlertActionLink>}
        variant={AlertVariant.danger}
      />
    );
  } else {
    alert = (
      <Alert variant={AlertVariant.info} isInline title={t('Delayed propagation of configuration')}>
        {t(
          "After saving the configuration, it may take approximately one hour to see if the settings are correct and the operators' statuses are updated.",
        )}
        <br />
        {t(
          'Note, that existing resources (like bound PVCs) will not be affected by later changes.',
        )}
      </Alert>
    );
  }

  const footer = (
    <>
      {isSaving ? <InProgress key="progress" text={t('Saving...')} /> : null}
      <Button key="cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>
      <Button key="save" variant="primary" isDisabled={isSaving || !isDirty} onClick={onSave}>
        Save configuration
      </Button>
    </>
  );
  return (
    // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
    <Modal
      className="vsphere-connection-modal"
      variant={ModalVariant.medium}
      position="top"
      title={t('vSphere connection configuration')}
      // description=""
      isOpen={isModalOpen}
      onClose={onClose}
      footer={footer}
    >
      <Stack hasGutter>
        <StackItem>
          <VSphereConnectionForm {...params} formId={formId} />
        </StackItem>
        <StackItem>
          <VSphereOperatorStatuses />
        </StackItem>
        <StackItem>{alert}</StackItem>
      </Stack>
    </Modal>
  );
};
