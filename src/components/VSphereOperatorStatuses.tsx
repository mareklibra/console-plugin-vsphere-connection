import * as React from 'react';
import { k8sGet, StatusPopupItem, StatusPopupSection } from '@openshift-console/dynamic-plugin-sdk';
import { CheckCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { TFunction } from 'react-i18next';
import { useTranslation } from '../i18n';
import {
  BooleanString,
  ClusterOperator,
  ClusterOperatorModel,
  CONSOLE_PREFIX_CLUSTER_OPERATOR,
  getCondition,
} from '../resources';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';

type OperatorHealthType = {
  message: string;
  icon: React.ReactNode | undefined;
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
      };
    }

    if (degraded === 'True') {
      return {
        message: t('Degraded'),
        icon: undefined,
      };
    }

    if (available === 'True') {
      return {
        message: t('Healthy'),
        // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
        icon: <CheckCircleIcon color={okColor.value} />,
      };
    }

    return {
      message: t('Unknown'),
      icon: undefined,
    };
  } catch (e) {
    console.error('Error getting operator status: ', name, e);
    return {
      message: t('Error'),
      icon: undefined,
    };
  }
};

export const VSphereOperatorStatuses: React.FC = () => {
  const { t } = useTranslation();
  const initialHealth = {
    message: t('Pending'),
    // @ts-expect-error: TODO: Fix TypeScript for ReactPortal
    icon: <InProgressIcon />,
  };
  const [kubeControllerManager, setKubeControllerManager] =
    React.useState<OperatorHealthType>(initialHealth);

  const timmer = 0; // TODO: add polling
  React.useEffect(() => {
    const doItAsync = async () => {
      setKubeControllerManager(await getOperatorHealth(t, 'kube-controller-manager'));
      // TODO: list all vSphere-related operators here
    };

    doItAsync();
  }, [timmer, t]);

  return (
    <StatusPopupSection firstColumn={t('Operator')} secondColumn={t('Status')}>
      <StatusPopupItem value={kubeControllerManager.message} icon={kubeControllerManager.icon}>
        <Link to={`${CONSOLE_PREFIX_CLUSTER_OPERATOR}/kube-controller-manager`}>
          Kube Controller Manager
        </Link>
      </StatusPopupItem>
    </StatusPopupSection>
  );
};
