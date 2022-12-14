import * as React from 'react';
import { StackItem, Stack } from '@patternfly/react-core';
import { HealthState } from '@openshift-console/dynamic-plugin-sdk';
import {
  PrometheusHealthPopupProps,
  PrometheusHealthHandler,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboard-types';

import { useTranslation } from '../../i18n';
import { VSphereConnection } from '../VSphereConnection';
import { ConfigMap } from '../../resources';
import { getVSphereHealth } from '../getVSphereHealth';

import './VSphereStatus.css';
import { VSphereOperatorStatuses } from '../VSphereOperatorStatuses';

// https://issues.redhat.com/browse/MGMT-9085
// https://access.redhat.com/solutions/6677901

const VSphereStatus: React.FC<
  PrometheusHealthPopupProps /* dummy placeholder, remove this comment later */ & {
    hide: () => void; // <-- do not merge, being added to the SDK
  }
> = ({ hide, responses, k8sResult }) => {
  const { t } = useTranslation();
  const health = getVSphereHealth(t, responses, k8sResult);

  if (
    [HealthState.OK, HealthState.WARNING, HealthState.PROGRESS].includes(health.state) &&
    k8sResult?.data
  ) {
    const cloudProviderConfig = k8sResult.data as ConfigMap | undefined;
    return (
      <VSphereConnection hide={hide} cloudProviderConfig={cloudProviderConfig} health={health} />
    );
  }

  if (health.state === HealthState.LOADING) {
    return (
      <Stack hasGutter>
        <StackItem>{t('Loading vSphere connection status...')}</StackItem>
      </Stack>
    );
  }

  return (
    <div>
      <Stack hasGutter>
        <StackItem>{t('The vSphere Connection check is failing.')}</StackItem>
        <StackItem>
          <VSphereOperatorStatuses />
        </StackItem>
      </Stack>
    </div>
  );
};

export const healthHandler: PrometheusHealthHandler = (responses, _skip, additionalResource) => {
  const health = getVSphereHealth(undefined /* TODO: Translate */, responses, additionalResource);
  const state = health.state;

  let message: string | undefined = undefined;
  switch (state) {
    case HealthState.WARNING:
      message = health.message;
      break;
    case HealthState.PROGRESS:
      message = 'Click for more details';
      break;
  }
  return { state, message };
};

export default VSphereStatus;
