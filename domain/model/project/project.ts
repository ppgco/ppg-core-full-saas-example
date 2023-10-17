import { IProvider, ProviderEnum } from "./providers/provider.ts";
import { VapidProvider } from "./providers/vapid.ts";

export type ProjectID = string;
export type ProjectName = string;

export interface IProject {
  id: ProjectID;
  name: ProjectName;
  providers: IProvider[];
}

export class Project implements IProject {
  static fromPlain(plain: IProject): Project {
    return new Project(plain.id, plain.name, plain.providers);
  }

  constructor(
    public readonly id: ProjectID,
    public readonly name: ProjectName,
    public readonly providers: IProvider[],
  ) {
  }

  async configureVapidProvider(): Promise<void> {
    if (
      this.providers.some((provider) => provider.type === ProviderEnum.VAPID)
    ) {
      throw new Error("Project currently have configured vapid provider.");
    }

    this.providers.push(
      {
        type: ProviderEnum.VAPID,
        payload: await VapidProvider.create(),
      },
    );
  }

  private assertProviderNotFound(provider: ProviderEnum): never {
    throw new Error("Provider not found:" + provider);
  }

  getProvider(provider: ProviderEnum) {
    return this.providers.find((item) => item.type === provider) ||
      this.assertProviderNotFound(provider);
  }

  valueOf() {
    return {
      id: this.id,
      name: this.name,
      providers: [...this.providers.map((item) => ({ ...item }))],
    };
  }
}
