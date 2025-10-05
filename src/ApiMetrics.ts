export interface ApiMetrics {
  name?: string;
  read: {
    ops: number;
    rows: number;
  };
  write: {
    ops: number;
    rows: number;
  };
}
