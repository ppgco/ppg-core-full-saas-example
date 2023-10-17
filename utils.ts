import { ApplicationConfig } from "./domain/application/config.ts";

export function url(path: string): string {
  const config = new ApplicationConfig();
  return [config.getApiEndpoint(), path].join("/");
}
