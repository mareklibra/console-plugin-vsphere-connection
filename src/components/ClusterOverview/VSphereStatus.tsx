import * as React from 'react';
import { StackItem, Stack } from '@patternfly/react-core';
// import { CheckCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import {
  HealthState,
  // PrometheusResponse,
  StatusPopupItem,
  StatusPopupSection,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  PrometheusHealthPopupProps,
  PrometheusHealthHandler,
  SubsystemHealth,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboard-types';
import { Link } from 'react-router-dom';
// import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';
import { useTranslation } from '../../i18n';

import './VSphereStatus.css';

// https://issues.redhat.com/browse/MGMT-9085
// https://access.redhat.com/solutions/6677901

const getVSphereHealth = (
  responses: PrometheusHealthPopupProps['responses'],
  configMapResult: PrometheusHealthPopupProps['k8sResult'],
): SubsystemHealth => {
  if (!configMapResult) {
    return { state: HealthState.LOADING };
  }

  if (configMapResult.loadError) {
    // TODO: decide between 404 and other error
    // TODO: Is 404 Degraded and other Error??
    return { state: HealthState.ERROR, message: 'Failing to load cloud-provider-config config map.' };
  }

  if (!configMapResult.loaded) {
    return { state: HealthState.LOADING };
  }

  // TODO check: does data contain 'secret-name = "vsphere-creds"'?

  if (!!responses.find((r) => r.error)) {
    if (configMapResult.loadError) {
      return { state: HealthState.ERROR, message: 'Prometheus query failed.' };
    }
  }
  // TODO: use Prometheus vsphere_sync_errors vector metric to check sync errors (by vSphere Problem Detector)

  // TODO: if ConfigMap is preent but error not reported then progress

  return { state: HealthState.OK };
};

const VSphereStatus: React.FC<PrometheusHealthPopupProps> = ({ responses, k8sResult }) => {
  const { t } = useTranslation();
  console.log('-- VSphereStatus, responses: ', responses, ', k8sResult: ', k8sResult);

  const health = getVSphereHealth(responses, k8sResult);

  if ([HealthState.OK, HealthState.WARNING].includes(health.state)) {
    /* TODO:
    - Show form + Save configurations button
    */
    return <div />;
  }

  if (health.state === HealthState.LOADING) {
    return (
      <Stack hasGutter>
        <StackItem>
          {t(
            'Loading vSphere connection status...'
          )}
        </StackItem>
      </Stack>
    );
  }

  return (
    <div>
      <Stack hasGutter>
        <StackItem>
          {t(
            'The vSphere Connection check is failing.',
          )}
        </StackItem>
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

export default VSphereStatus;

export const healthHandler: PrometheusHealthHandler = (responses, _skip, additionalResource) => {
  console.log(
    '-- healthHandler, responses: ',
    responses,
    ', additionalReource: ',
    additionalResource,
  );

  return { state: getVSphereHealth(responses, additionalResource).state };
};
