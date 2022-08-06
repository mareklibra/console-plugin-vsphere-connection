import * as React from 'react';
import { ConnectionFormContextProvider } from './ConnectionFormContext';
import { VSphereConnectionForm, VSphereConnectionProps } from './VSphereConnectionForm';

// TODO: try that as a modal
export const VSphereConnection: React.FC<VSphereConnectionProps> = (params) => (
  <ConnectionFormContextProvider>
    <VSphereConnectionForm {...params} />
  </ConnectionFormContextProvider>
);
