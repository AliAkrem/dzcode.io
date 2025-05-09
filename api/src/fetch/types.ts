export interface FetchConfig {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}
