export type Ditto = {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
};

export type State = {
  data: Ditto | null;
  isLoading: boolean;
  error: string | null;
};
