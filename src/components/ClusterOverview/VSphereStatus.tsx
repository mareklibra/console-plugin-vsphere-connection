import * as React from 'react';
import { StackItem, Stack } from '@patternfly/react-core';
import {
  HealthState,
  StatusPopupItem,
  StatusPopupSection,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  PrometheusHealthPopupProps,
  PrometheusHealthHandler,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboard-types';
import { Link } from 'react-router-dom';

import { useTranslation } from '../../i18n';
import { VSphereConnection } from '../VSphereConnection';
import { ConfigMap } from '../../resources';
import { getVSphereHealth } from '../getVSphereHealth';

import './VSphereStatus.css';

// https://issues.redhat.com/browse/MGMT-9085
// https://access.redhat.com/solutions/6677901

const VSphereStatus: React.FC<PrometheusHealthPopupProps & { hide: () => void }> = ({
  hide,
  responses,
  k8sResult,
}) => {
  const { t } = useTranslation();
  const health = getVSphereHealth(t, responses, k8sResult);

  if ([HealthState.OK, HealthState.WARNING].includes(health.state) && k8sResult?.data) {
    const cloudProviderConfig = k8sResult.data as ConfigMap | undefined;
    return <VSphereConnection hide={hide} cloudProviderConfig={cloudProviderConfig} />;
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
          <StatusPopupSection firstColumn={t('Resource')} secondColumn={t('Status')}>
            <StatusPopupItem value={health.message}>
              <Link to="/monitoring/query-browser?query0=vsphere_sync_errors">
                {t('vSphere Problem Detector')}
              </Link>
            </StatusPopupItem>
          </StatusPopupSection>
        </StackItem>
      </Stack>
    </div>
  );
};

export const healthHandler: PrometheusHealthHandler = (responses, _skip, additionalResource) => {
  return { state: getVSphereHealth(undefined, responses, additionalResource).state };
};

export default VSphereStatus;
