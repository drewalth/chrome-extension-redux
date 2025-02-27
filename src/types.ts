export type Ditto = {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
};

export type StorageData = {
  data: Ditto | null;
  timestamp: number;
};

