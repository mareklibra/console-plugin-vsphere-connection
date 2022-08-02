# OpenShift Console vSphere Connection Plugin

Dynamic plugin for the OpenShift console which introduces capability to add vSphere connection.

## QuickStart

### Prerequisites

- [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift) 4.11+
- TODO: vSphere operator

### Deployment

```
# TODO: Add intructions for deployment
# Note: This project is WIP, distribution model will be clarified later

# check if a plugins field is specified
$ oc get consoles.operator.openshift.io cluster --output=jsonpath="{.spec.plugins}"

# if not, then run the following to enable the plugin
$ kubectl patch consoles.operator.openshift.io cluster --patch '{ "spec": { "plugins": ["console-plugin-vsphere-connection"] } }' --type=merge

# if yes, then run the following to enable the plugin
$ kubectl patch consoles.operator.openshift.io cluster --patch '[{"op": "add", "path": "/spec/plugins/-", "value": "console-plugin-vsphere-connection" }]' --type=json
```

### Local development

OpenShift Console plugin works as a remote bundle for the OCP console. To run OpenShift
Console vSphere Connection Plugin there should be an instance of the OCP console up and running.
Follow these steps to run the OCP Console in development mode:

 - Follow everything as mentioned in the console [README.md](https://github.com/openshift/console)
   to build the application.
 - Run the console bridge as follows `./bin/bridge -plugins console-plugin-vsphere-connection=http://127.0.0.1:9001/`
 - Run developemnt mode of console by going into `console/frontend` and running `yarn run dev`

After the OCP console is set as required by the ODF Console. Perform the following steps to make it
run:

 - TODO: Install & setup the vSphere Operator
 - Clone this repo
 - Pull all required dependencies by running `yarn install`
 - Run the development mode by running `yarn start`

