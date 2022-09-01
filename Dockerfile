FROM registry.access.redhat.com/ubi8/nodejs-16:latest AS builder
USER root
RUN corepack enable yarn

COPY . /opt/app-root/src
RUN yarn install --frozen-lockfile && yarn build

# Final image
FROM registry.access.redhat.com/ubi8/nginx-118:1-67
COPY --from=builder /opt/app-root/src/dist/ .
COPY --from=builder /opt/app-root/src/default.conf "${NGINX_CONFIGURATION_PATH}"
USER ${USER_UID}
EXPOSE 9443

CMD ["nginx", "-g", "daemon off;"]

LABEL com.redhat.component="console-vsphere-connection-plugin-container" \
      name="openshift4/console-vsphere-connection-plugin-rhel8" \
      version="v1.0.0" \
      upstream_commit="${TODO_CI_ASSISTED_INSTALLER_UPSTREAM_COMMIT}" \
      summary="OpenShift Console dynamic plugin for setting configuration of vSphere connection." \
      io.k8s.display-name="OpenShift Console vSphere Connection plugin" \
      maintainer="Marek Libra <mlibra@redhat.com>" \
      description="OpenShift Console dynamic plugin for vSphere connection configuration"



