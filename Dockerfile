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

