type EnvironmentVariableName =
  | "API_ENDPOINT"
  | "PPG_CORE_TOKEN"
  | "PPG_CORE_ENDPOINT";
enum EnvironmentVariableValidationType {
  NONE,
  STRING,
  NUMBER,
  BOOLEAN,
}

export interface IConfig {
  getApiEndpoint(): string;
  getPpgCoreApiToken(): string;
  getPpgCoreApiEndpoint(): string;
}

export class DummyConfig implements IConfig {
  getApiEndpoint() {
    return "https://sample.api.dummy.endpoint/";
  }

  getPpgCoreApiToken() {
    return "dummy-token";
  }

  getPpgCoreApiEndpoint() {
    return "https://core-sample.endpoint";
  }
}

export class ApplicationConfig implements IConfig {
  constructor() {
  }

  private resolveOrThrow(
    name: EnvironmentVariableName,
    type: EnvironmentVariableValidationType =
      EnvironmentVariableValidationType.NONE,
  ) {
    const data = Deno.env.get(name);

    switch (type) {
      case EnvironmentVariableValidationType.STRING:
        if (typeof data === "undefined") {
          throw new Error(
            `Cannot get ENV variable ${name}. Make sure that you add ${name}=sample before you run program.`,
          );
        }

        return data;

      case EnvironmentVariableValidationType.NUMBER:
        if (typeof data === "undefined") {
          throw new Error(
            `Cannot get ENV variable ${name}. Make sure that you add ${name}=100 before you run program.`,
          );
        }

        return ~~data;

      case EnvironmentVariableValidationType.BOOLEAN:
        if (typeof data === "undefined") {
          throw new Error(
            `Cannot get ENV variable ${name}. Make sure that you add ${name}=true/false before you run program.`,
          );
        }

        return !!data;

      case EnvironmentVariableValidationType.NONE:
      default:
        if (typeof data === "undefined") {
          throw new Error(
            `Cannot get ENV variable ${name}. Make sure that you add ${name}=value before you run program.`,
          );
        }

        return data;
    }
  }

  getApiEndpoint(): string {
    return this.resolveOrThrow("API_ENDPOINT") as string;
  }

  getPpgCoreApiToken(): string {
    return this.resolveOrThrow("PPG_CORE_TOKEN") as string;
  }

  getPpgCoreApiEndpoint(): string {
    return this.resolveOrThrow("PPG_CORE_ENDPOINT") as string;
  }
}
