import { TFunction } from 'react-i18next';
import {
  HealthState,
  PrometheusHealthPopupProps,
  PrometheusResult,
  PrometheusValue,
  SubsystemHealth,
} from '@openshift-console/dynamic-plugin-sdk';

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
    return {
      state: HealthState.WARNING,
      message: t('Failed to load vSphere connection config map.'),
    };
  }

  if (!configMapResult.loaded) {
    return { state: HealthState.LOADING };
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

  if (getPrometheusMetricValue(prometheusResult, 'InvalidCredentials')?.[0]) {
    console.error(
      'Prometheus query - invalid credentials: ',
      getPrometheusMetricValue(prometheusResult, 'InvalidCredentials'),
    );
    // TODO: Add timestamp to the message

    return { state: HealthState.WARNING, message: t('Invalid credentials') };
  }

  if (getPrometheusMetricValue(prometheusResult, 'SyncError')?.[0]) {
    console.error(
      'Prometheus query - synchronization failed: ',
      getPrometheusMetricValue(prometheusResult, t('SyncError')),
    );
    // TODO: Add timestamp to the message
    return { state: HealthState.WARNING, message: 'Synchronization failed' };
  }

  const anyFailingMetric = prometheusResult.find((r) => r.value?.[0]);
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
