import * as React from 'react';
import {
  ActionGroup,
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { HealthState, SubsystemHealth, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { useTranslation } from '../i18n';
import { ConfigMap } from '../resources';
import { ConnectionFormContextProvider, useConnectionFormContext } from './ConnectionFormContext';
import { initialLoad } from './initialLoad';
import { persist } from './persist';

type VSphereConnectionProps = {
  hide: () => void;
  cloudProviderConfig?: ConfigMap;
  health: SubsystemHealth;
};

const VSphereConnectionForm: React.FC<VSphereConnectionProps> = ({
  hide,
  cloudProviderConfig,
  health,
}) => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [SecretModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'Secret' });
  const [ConfigMapModel] = useK8sModel({ group: 'app', version: 'v1', kind: 'ConfigMap' });

  const {
    vcenter,
    username,
    password,
    datacenter,
    defaultdatastore,
    folder,

    setVcenter,
    setUsername,
    setPassword,
    setDatacenter,
    setDefaultdatastore,
    setFolder,
  } = useConnectionFormContext();

  const onCancel = () => {
    hide && hide();
  };

  const onSave = () => {
    const doItAsync = async () => {
      // TODO: a warning based on prometheus metric will apear until next error
      setError('');

      const errorMsg = await persist(t, SecretModel, ConfigMapModel, {
        vcenter,
        username,
        password,
        datacenter,
        defaultdatastore,
        folder,
      });

      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      // TODO: monitor progress and give it try
    };

    doItAsync();
  };

  // initial load
  React.useEffect(() => {
    const doItAsync = async () => {
      if (isLoaded) {
        return;
      }
      if (!cloudProviderConfig) {
        return;
      }

      setIsLoaded(true);
      await initialLoad(
        {
          setVcenter,
          setUsername,
          setPassword,
          setDatacenter,
          setDefaultdatastore,
          setFolder,
        },
        SecretModel,
        cloudProviderConfig,
      );
    };

    doItAsync();
  }, [
    SecretModel,
    cloudProviderConfig,
    isLoaded,
    setDatacenter,
    setDefaultdatastore,
    setFolder,
    setPassword,
    setUsername,
    setVcenter,
  ]);

  return (
    <Form>
      <FormGroup
        label="vCenter"
        isRequired
        fieldId="connection-vcenter"
        helperText="vCenter address"
      >
        <TextInput
          isRequired
          type="text"
          id="connection-vcenter"
          name="vcenter"
          aria-describedby="connection-vcenter-helper"
          value={vcenter}
          onChange={setVcenter}
        />
      </FormGroup>
      <FormGroup label="Username" isRequired fieldId="connection-username">
        <TextInput
          isRequired
          type="text"
          id="connection-username"
          name="username"
          value={username}
          onChange={setUsername}
        />
      </FormGroup>
      <FormGroup label="Password" isRequired fieldId="connection-password">
        <TextInput
          isRequired
          type="password"
          id="connection-password"
          name="password"
          value={password}
          onChange={setPassword}
        />
      </FormGroup>
      <FormGroup label="Datacenter" isRequired fieldId="connection-datacenter">
        <TextInput
          isRequired
          type="text"
          id="connection-datacenter"
          name="datacenter"
          value={datacenter}
          onChange={setDatacenter}
        />
      </FormGroup>
      <FormGroup label="Default data store" isRequired fieldId="connection-defaultdatastore">
        <TextInput
          isRequired
          type="text"
          id="connection-defaultdatastore"
          name="defaultdatastore"
          value={defaultdatastore}
          onChange={setDefaultdatastore}
        />
      </FormGroup>
      <FormGroup label="Folder" isRequired fieldId="connection-folder">
        <TextInput
          isRequired
          type="text"
          id="connection-folder"
          name="folder"
          value={folder}
          onChange={setFolder}
        />
      </FormGroup>

      {!error && health.state === HealthState.WARNING && (
        <Alert isInline title={health.message} variant={AlertVariant.warning} />
      )}
      {error && (
        <Alert
          isInline
          title={error}
          actionLinks={<AlertActionLink onClick={onSave}>{t('Retry')}</AlertActionLink>}
          variant={AlertVariant.danger}
        />
      )}

      <ActionGroup>
        <Button variant="primary" onClick={onSave}>
          Save configuration
        </Button>
        <Button variant="link" isDisabled={!hide} onClick={onCancel}>
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

export const VSphereConnection: React.FC<VSphereConnectionProps> = (params) => (
  <ConnectionFormContextProvider>
    <VSphereConnectionForm {...params} />
  </ConnectionFormContextProvider>
);
