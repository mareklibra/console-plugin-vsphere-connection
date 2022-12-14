import * as React from 'react';
import { k8sGet, StatusPopupItem, StatusPopupSection } from '@openshift-console/dynamic-plugin-sdk';
import {
  CheckCircleIcon,
  InProgressIcon,
  ExclamationCircleIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { TFunction } from 'react-i18next';
import {
  global_palette_green_500 as okColor,
  global_palette_red_100 as errorColor,
} from '@patternfly/react-tokens';
import { ExpandableSection } from '@patternfly/react-core';

import { useTranslation } from '../i18n';
import {
  BooleanString,
  ClusterOperator,
  ClusterOperatorModel,
  CONSOLE_PREFIX_CLUSTER_OPERATOR,
  getCondition,
} from '../resources';
import { delay } from './utils';
import { DELAY_BEFORE_POLLING_RETRY_MEDIUM } from '../constants';

let ohlCounter = 0;
const OperatorHealthLevel: { [key: string]: number } = {
  // The order matters!
  Unknown: ohlCounter++,
  Healthy: ohlCounter++,
  Progressing: ohlCounter++,
  Degraded: ohlCounter++,
  Error: ohlCounter++,
};

type OperatorHealthType = {
  message: string;
  icon: React.ReactNode | undefined;
  level: number;
};

const getWorstIconState = (states: OperatorHealthType[]): OperatorHealthType['icon'] => {
  let worst = states[0];
  states.forEach((state) => {
    if (worst.level < state.level) {
      worst = state;
    }
  });

  return worst.icon;
};

const getOperatorHealth = async (t: TFunction, name: string): Promise<OperatorHealthType> => {
  try {
    const operator = await k8sGet<ClusterOperator>({ model: ClusterOperatorModel, name });

    const progressing = getCondition(operator, 'Progressing')?.status as BooleanString | undefined;
    const available = getCondition(operator, 'Available')?.status as BooleanString | undefined;
    const degraded = getCondition(operator, 'Degraded')?.status as BooleanString | undefined;

    if (progressing === 'True') {
      return {
        message: t('Progressing'),
        // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
        icon: <InProgressIcon />,
        level: OperatorHealthLevel.Progressing,
      };
    }

    if (degraded === 'True') {
      return {
        message: t('Degraded'),
        // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
        icon: <ExclamationCircleIcon color={errorColor.value} />,
        level: OperatorHealthLevel.Degraded,
      };
    }

    if (available === 'True') {
      return {
        message: t('Healthy'),
        // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
        icon: <CheckCircleIcon color={okColor.value} />,
        level: OperatorHealthLevel.Healthy,
      };
    }

    return {
      message: t('Unknown'),
      // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
      icon: <UnknownIcon />,
      level: OperatorHealthLevel.Unknown,
    };
  } catch (e) {
    console.error('Error getting operator status: ', name, e);
    return {
      message: t('Error'),
      // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
      icon: <ExclamationCircleIcon color={errorColor.value} />,
      level: OperatorHealthLevel.Error,
    };
  }
};

export const VSphereOperatorStatuses: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const initialHealth = {
    message: t('Pending'),
    // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
    icon: <InProgressIcon />,
    level: OperatorHealthLevel.Unknown,
  };
  const [kubeControllerManager, setKubeControllerManager] =
    React.useState<OperatorHealthType>(initialHealth);
  const [kubeApiServer, setKubeApiServer] = React.useState<OperatorHealthType>(initialHealth);
  const [storage, setStorage] = React.useState<OperatorHealthType>(initialHealth);

  const [pollingTimmer, setPollingTimmer] = React.useState<number>(0);

  React.useEffect(() => {
    const doItAsync = async () => {
      setKubeControllerManager(await getOperatorHealth(t, 'kube-controller-manager'));
      setKubeApiServer(await getOperatorHealth(t, 'kube-apiserver'));
      setStorage(await getOperatorHealth(t, 'storage'));

      await delay(DELAY_BEFORE_POLLING_RETRY_MEDIUM);
      setPollingTimmer(pollingTimmer + 1);
    };

    doItAsync();
  }, [pollingTimmer, t]);

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  // TODO: calculate from all vSphere-related operators
  const worstIconState = getWorstIconState([kubeApiServer, kubeControllerManager, storage]);

  return (
    <ExpandableSection
      toggleContent={
        <span>
          {t('Monitored operators')} {isExpanded ? null : worstIconState}
        </span>
      }
      onToggle={onToggle}
      isExpanded={isExpanded}
    >
      <StatusPopupSection firstColumn={t('Operator')} secondColumn={t('Status')}>
        <StatusPopupItem value={kubeApiServer.message} icon={kubeApiServer.icon}>
          <Link to={`${CONSOLE_PREFIX_CLUSTER_OPERATOR}/kube-apiserver`}>
            {t('Kube API Server')}
          </Link>
        </StatusPopupItem>

        <StatusPopupItem value={kubeControllerManager.message} icon={kubeControllerManager.icon}>
          <Link to={`${CONSOLE_PREFIX_CLUSTER_OPERATOR}/kube-controller-manager`}>
            {t('Kube Controller Manager')}
          </Link>
        </StatusPopupItem>

        <StatusPopupItem value={storage.message} icon={storage.icon}>
          <Link to={`${CONSOLE_PREFIX_CLUSTER_OPERATOR}/storage`}>{t('Storage')}</Link>
        </StatusPopupItem>
      </StatusPopupSection>
    </ExpandableSection>
  );
};
