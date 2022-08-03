export type ConnectionFormContextSetters = {
  setVcenter: (v: string) => void;
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  setDatacenter: (v: string) => void;
  setDefaultdatastore: (v: string) => void;
  setFolder: (v: string) => void;
};

export type ConnectionFormContextData = {
  vcenter?: string;
  username?: string;
  password?: string;
  datacenter?: string;
  defaultdatastore?: string;
  folder?: string;
} & ConnectionFormContextSetters;
