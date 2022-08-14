import { TFunction } from 'react-i18next';
import {
  HealthState,
  PrometheusHealthPopupProps,
  PrometheusResult,
  PrometheusValue,
  SubsystemHealth,
} from '@openshift-console/dynamic-plugin-sdk';
import { toInteger } from 'lodash';
import { getIsBrandNewConfiguration } from './initialLoad';
import { ConfigMap } from 'src/resources';

const getPrometheusMetricValue = (
  prometheusResult: PrometheusResult[],
  reason: string,
): PrometheusValue | undefined => prometheusResult.find((r) => r.metric.reason === reason)?.value;

export const getVSphereHealth = (
  t: TFunction = (s: string) => s,
  responses: PrometheusHealthPopupProps['responses'],
  configMapResult: PrometheusHealthPopupProps['k8sResult'],
): SubsystemHealth => {
  if (!configMapResult) {
    return { state: HealthState.LOADING };
  }

  if (configMapResult.loadError) {
    // This should not happen if the vSphere FLAG is true
    return {
      state: HealthState.WARNING,
      message: t('Missing the vSphere config map.'),
    };
  }

  if (!configMapResult.loaded) {
    return { state: HealthState.LOADING };
  }

  const cloudProviderConfig = configMapResult.data as ConfigMap | undefined;
  if (!cloudProviderConfig || getIsBrandNewConfiguration(cloudProviderConfig)) {
    return {
      state: HealthState.WARNING,
      message: t('Not configured yet'),
    };
  }

  // by vSphere Problem Detector
  if (responses.length < 1) {
    return { state: HealthState.LOADING };
  }

  if (responses.find((r) => r.error)) {
    console.error('Prometheus query error: ', responses);
    return { state: HealthState.ERROR, message: t('Prometheus query failed.') };
  }

  if (!responses[0].response?.status) {
    return { state: HealthState.LOADING };
  }

  const prometheusResult = responses[0].response?.data?.result;
  if (responses[0].response.status !== 'success' || !prometheusResult) {
    console.error('Prometheus query error: ', responses);
    return { state: HealthState.ERROR, message: t('Prometheus query failed.') };
  }

  const invCreds = getPrometheusMetricValue(prometheusResult, 'InvalidCredentials');

  // console.log(
  //   '--- invCreds[0]: ',
  //   invCreds?.[0],
  //   ', formatted: ',
  //   new Date(invCreds?.[0] || 0).toLocaleDateString(),
  // );

  if (invCreds?.[0] && toInteger(invCreds?.[1]) > 0) {
    console.error('Prometheus query - invalid credentials: ', invCreds);
    // TODO: Add timestamp to the message but where to get it from?? It's not invCreds[0]

    return { state: HealthState.WARNING, message: t('Invalid credentials') };
  }

  const syncErr = getPrometheusMetricValue(prometheusResult, 'SyncError');
  if (toInteger(syncErr?.[1])) {
    console.error('Prometheus query - synchronization failed: ', syncErr);
    // TODO: Add timestamp to the message
    return { state: HealthState.WARNING, message: 'Synchronization failed' };
  }

  const anyFailingMetric = prometheusResult.find((r) => toInteger(r.value?.[1]) > 0);
  if (anyFailingMetric) {
    console.error('Prometheus query - a failing metric found: ', anyFailingMetric);
    // TODO: Add timestamp to the message
    return {
      state: HealthState.WARNING,
      message: t('Failing {{reason}}', { reason: anyFailingMetric.metric.reason }),
    };
  }

  return { state: HealthState.OK };
};
