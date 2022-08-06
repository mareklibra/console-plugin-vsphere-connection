import * as React from 'react';
import { ConnectionFormContextProvider } from './ConnectionFormContext';
import { VSphereConnectionForm, VSphereConnectionProps } from './VSphereConnectionForm';

export const VSphereConnection: React.FC<VSphereConnectionProps> = (params) => (
  <ConnectionFormContextProvider>
    <VSphereConnectionForm {...params} />
  </ConnectionFormContextProvider>
);
