import * as React from 'react';
import {
  ActionGroup,
  Alert,
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
  const [SecretModel] = useK8sModel({ group: 'app' /* TODO ??? */, version: 'v1', kind: 'Secret' });

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
    console.log('TODO');
  };

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
      {health.state === HealthState.WARNING && (
        <Alert isInline title={t('vSphere Problem Detector')} variant={AlertVariant.warning}>
          {health.message}
        </Alert>
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
