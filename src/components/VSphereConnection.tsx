import * as React from 'react';
import { ActionGroup, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { ConfigMap } from '../resources';
import { ConnectionFormContextProvider, useConnectionFormContext } from './ConnectionFormContext';

type VSphereConnectionProps = {
    hide: () => void;
    cloudProviderConfig: ConfigMap;
};

const VSphereConnectionForm: React.FC<VSphereConnectionProps> = ({ hide, cloudProviderConfig }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const {
        vcenter,
        username,
        password,
        datacenter,
        defaultdatastore,
        folder,

        setVcenter,
        setUsername,
        setPassword,
        setDatacenter,
        setDefaultdatastore,
        setFolder,
    } = useConnectionFormContext()

    const onCancel = () => {
        hide && hide();
    }

    const onSave = () => {
        console.log('TODO');
    }

    React.useEffect(() => {
        if (!cloudProviderConfig) {
            return;
        }

        if (!isLoaded) {
            setIsLoaded(true);
            initialLoad({
                setVcenter,
                setUsername,
                setPassword,
                setDatacenter,
                setDefaultdatastore,
                setFolder,
            }, cloudProviderConfig);
        }
    }, [cloudProviderConfig]);

    return (
        <Form>
            <FormGroup
                label="vCenter"
                isRequired
                fieldId="connection-vcenter"
                helperText="vCenter address"
            >
                <TextInput
                    isRequired
                    type="text"
                    id="connection-vcenter"
                    name="vcenter"
                    aria-describedby="connection-vcenter-helper"
                    value={vcenter}
                    onChange={setVcenter}
                />
            </FormGroup>
            <FormGroup label="Username" isRequired fieldId="connection-username">
                <TextInput
                    isRequired
                    type="text"
                    id="connection-username"
                    name="username"
                    value={username}
                    onChange={setUsername}
                />
            </FormGroup>
            <FormGroup label="Password" isRequired fieldId="connection-password">
                <TextInput
                    isRequired
                    type="password"
                    id="connection-password"
                    name="password"
                    value={password}
                    onChange={setPassword}
                />
            </FormGroup>
            <FormGroup label="Datacenter" isRequired fieldId="connection-datacenter">
                <TextInput
                    isRequired
                    type="text"
                    id="connection-datacenter"
                    name="datacenter"
                    value={datacenter}
                    onChange={setDatacenter}
                />
            </FormGroup>
            <FormGroup label="Default data store" isRequired fieldId="connection-defaultdatastore">
                <TextInput
                    isRequired
                    type="text"
                    id="connection-defaultdatastore"
                    name="defaultdatastore"
                    value={defaultdatastore}
                    onChange={setDefaultdatastore}
                />
            </FormGroup>
            <FormGroup label="Folder" isRequired fieldId="connection-folder">
                <TextInput
                    isRequired
                    type="text"
                    id="connection-folder"
                    name="folder"
                    value={folder}
                    onChange={setFolder}
                />
            </FormGroup>
            <ActionGroup>
                <Button variant="primary" onClick={onSave}>Save configuration</Button>
                <Button variant="link" isDisabled={!hide} onClick={onCancel}>Cancel</Button>
            </ActionGroup>
        </Form>
    );
}

export const VSphereConnection: React.FC<VSphereConnectionProps> = ({ hide, cloudProviderConfig }) => {
    console.log('--- VSphereConnection, hide: ', hide);

    return (
        <ConnectionFormContextProvider>
            <VSphereConnectionForm hide={hide} />
        </ConnectionFormContextProvider>
    );
}