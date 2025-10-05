export interface ApiMetrics {
  read: {
    ops: number;
    rows: number;
  };
  write: {
    ops: number;
    rows: number;
  };
}
