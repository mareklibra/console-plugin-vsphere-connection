import { k8sCreate, k8sGet, K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TFunction } from 'react-i18next';

import { ConfigMap, KubeControllerManager, KubeControllerManagerModel } from '../resources';
import {
  KUBE_CONTROLLER_MANAGER_NAME,
  VSPHERE_CONFIGMAP_NAME,
  VSPHERE_CONFIGMAP_NAMESPACE,
  VSPHERE_CREDS_SECRET_NAME,
  VSPHERE_CREDS_SECRET_NAMESPACE,
} from '../constants';
import { ConnectionFormContextValues } from './types';
import { encodeBase64, mergeCloudProviderConfig } from './utils';

const persistSecret = async (
  t: TFunction,
  SecretModel: K8sModel,
  config: ConnectionFormContextValues,
): Promise<string | undefined> => {
  console.log('Calling persistSecret for vSphere');
  const { vcenter, username, password } = config;

  const usernameB64 = encodeBase64(username);
  const passwordB64 = encodeBase64(password);

  const secretData = {
    [`${vcenter}.username`]: usernameB64,
    [`${vcenter}.password`]: passwordB64,
  };

  // Assumption: the ConfigMap and Secret are already created from deployment so we can PATCH right away
  try {
    await k8sPatch({
      model: SecretModel,
      resource: {
        metadata: {
          name: VSPHERE_CREDS_SECRET_NAME,
          namespace: VSPHERE_CREDS_SECRET_NAMESPACE,
        },
      },
      data: [
        {
          op: 'replace',
          path: '/data',
          value: secretData,
        },
      ],
    });
  } catch (e) {
    console.error('Error when patching secret: ', e);
    return t('Failed to patch {{secret}}', { secret: VSPHERE_CREDS_SECRET_NAME });
  }
  return undefined;
};

/** oc patch kubecontrollermanager cluster -p='{"spec": {"forceRedeploymentReason": "recovery-'"$( date --rfc-3339=ns )"'"}}' --type=merge */
const patchKubeControllerManager = async (t: TFunction): Promise<string | undefined> => {
  console.log('Calling patchKubeControllerManager()');
  try {
    const cm = await k8sGet<KubeControllerManager>({
      model: KubeControllerManagerModel,
      name: KUBE_CONTROLLER_MANAGER_NAME,
    });

    if (!cm) {
      return t('Failed to load kubecontrollermanager');
    }

    cm.spec = cm.spec || {};
    const date = new Date().toISOString();
    cm.spec.forceRedeploymentReason = `recovery-${date}`;

    await k8sPatch({
      model: KubeControllerManagerModel,
      resource: {
        metadata: {
          name: KUBE_CONTROLLER_MANAGER_NAME,
        },
      },
      data: [
        {
          op: 'replace',
          path: '/spec',
          value: cm.spec,
        },
      ],
    });
  } catch (e) {
    console.error('Error when patching kubecontrollermanager: ', e);
    return t('Failed to patch kubecontrollermanager');
  }

  return undefined;
};

const persistProviderConfigMap = async (
  t: TFunction,
  ConfigMapModel: K8sModel,
  config: ConnectionFormContextValues,
  cloudProviderConfig?: ConfigMap,
): Promise<string | undefined> => {
  const { vcenter, datacenter, defaultdatastore, folder } = config;

  if (cloudProviderConfig) {
    console.info('About to patch existing cloud-provider configmap: ', VSPHERE_CONFIGMAP_NAME);

    const configIniString = mergeCloudProviderConfig(
      cloudProviderConfig.data?.config || '',
      config,
    );

    try {
      await k8sPatch({
        model: ConfigMapModel,
        resource: {
          metadata: {
            name: VSPHERE_CONFIGMAP_NAME,
            namespace: VSPHERE_CONFIGMAP_NAMESPACE,
          },
        },
        data: [
          {
            op: cloudProviderConfig.data ? 'replace' : 'add',
            path: '/data',
            value: { config: configIniString },
          },
        ],
      });
    } catch (e) {
      console.error('Error when patching configmap: ', e);
      return t('Failed to patch {{cm}}', { cm: VSPHERE_CONFIGMAP_NAME });
    }
  } else {
    console.info(
      'The cloud-provider configmap not found, creating a new one: ',
      VSPHERE_CONFIGMAP_NAME,
    );

    // Keep the allignment
    const configIni = `[Global]
secret-name = "${VSPHERE_CREDS_SECRET_NAME}"
secret-namespace = "${VSPHERE_CREDS_SECRET_NAMESPACE}"
insecure-flag = "1"

[Workspace]
server = "${vcenter}"
datacenter = "${datacenter}"
default-datastore = "${defaultdatastore}"
folder = "${folder}"

[VirtualCenter "${vcenter}"]
datacenters = "${datacenter}"
`;

    const data: ConfigMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: VSPHERE_CONFIGMAP_NAME,
        namespace: VSPHERE_CONFIGMAP_NAMESPACE,
      },
      data: {
        config: configIni,
      },
    };

    try {
      await k8sCreate({
        model: ConfigMapModel,
        data,
      });
    } catch (e) {
      console.error('Error when patching configmap: ', e);
      return t('Failed to patch {{cm}}', { cm: VSPHERE_CONFIGMAP_NAME });
    }
  }

  return undefined;
};

export const persist = async (
  t: TFunction,
  {
    SecretModel,
    ConfigMapModel,
  }: {
    SecretModel: K8sModel;
    ConfigMapModel: K8sModel;
  },
  config: ConnectionFormContextValues,
  cloudProviderConfig?: ConfigMap,
): Promise<string | undefined> => {
  console.info('Calling persist() of vSphere connection configuration');

  // return "undefined" if success
  return (
    (await persistSecret(t, SecretModel, config)) ||
    (await patchKubeControllerManager(t)) ||
    (await persistProviderConfigMap(t, ConfigMapModel, config, cloudProviderConfig))
  );
};
