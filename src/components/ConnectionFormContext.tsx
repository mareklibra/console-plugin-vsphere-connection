import React from 'react';
import { ConnectionFormContextData } from './types';

const ConnectionFormContext = React.createContext<ConnectionFormContextData | null>(null);

export const ConnectionFormContextProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [vcenter, setVcenter] = React.useState<string>();
    const [username, setUsername] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();
    const [datacenter, setDatacenter] = React.useState<string>();
    const [defaultdatastore, setDefaultdatastore] = React.useState<string>();
    const [folder, setFolder] = React.useState<string>();

    const value = React.useMemo(() => ({
        vcenter,
        setVcenter,

        username,
        setUsername,

        password,
        setPassword,

        datacenter,
        setDatacenter,

        defaultdatastore,
        setDefaultdatastore,

        folder,
        setFolder,
    }), []);

    return <ConnectionFormContext.Provider value={value}>{children}</ConnectionFormContext.Provider>;
};

export const useConnectionFormContext = () => {
    const context = React.useContext(ConnectionFormContext);
    if (!context) {
        throw new Error('useConnectionFormContext must be used within ConnectionFormContextProvider.');
    }
    return context;
};
