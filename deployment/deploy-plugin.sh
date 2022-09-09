#!/bin/bash

function applyManifest {
  curl -k $1 | \
    sed -e "s/VSPHERE_NAMESPACE/${VSPHERE_NAMESPACE}/g" | \
    oc apply -f -
}

###

set -ex

export VSPHERE_NAMESPACE=vsphere-plugin

oc new-project "${VSPHERE_NAMESPACE}" || true

applyManifest "https://raw.githubusercontent.com/mareklibra/console-plugin-vsphere-connection/main/deployment/deployment.yaml "
applyManifest "https://raw.githubusercontent.com/mareklibra/console-plugin-vsphere-connection/main/deployment/service.yaml"
applyManifest "https://raw.githubusercontent.com/mareklibra/console-plugin-vsphere-connection/main/deployment/route.yaml"
applyManifest "https://raw.githubusercontent.com/mareklibra/console-plugin-vsphere-connection/main/deployment/console-plugin.yaml"
