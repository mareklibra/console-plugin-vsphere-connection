/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/components/utils.test.ts TAP mergeCloudProviderConfig - delete old Virtual Center > must match snapshot 1`] = `
[Global]
secret-name=vsphere-creds
secret-namespace=kube-system
insecure-flag=1

[Workspace]
foo=bar
foofoo=barbar
server=https://1.2.3.4/something
datacenter=my-datacenter
default-datastore=my-default-ds
folder=/my/folder

[VirtualCenter "https://1.2.3.4/something"]
datacenters=my-datacenter

`

exports[`src/components/utils.test.ts TAP mergeCloudProviderConfig - empty > must match snapshot 1`] = `
[Global]
secret-name=vsphere-creds
secret-namespace=kube-system
insecure-flag=1

[Workspace]
server=https://1.2.3.4/something
datacenter=my-datacenter
default-datastore=my-default-ds
folder=/my/folder

[VirtualCenter "https://1.2.3.4/something"]
datacenters=my-datacenter

`
