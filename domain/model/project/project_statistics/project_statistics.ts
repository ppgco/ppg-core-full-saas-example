import { ProviderEnum } from "../providers/provider.ts";
import { ProjectID } from "../project.ts";

export type ProjectStatisticsKey = string;

export type IProjectStatistics = {
  id: ProjectID;
  day: string;
  data: Record<ProjectStatisticsKey, number>;
};

export class ProjectStatistics {
  static fromPlain(plain: IProjectStatistics): ProjectStatistics {
    const state = new Map();

    for (const key in plain.data) {
      const val = plain.data[key];
      state.set(key, val);
    }

    return new ProjectStatistics(plain.id, plain.day, state);
  }

  constructor(
    public readonly id: ProjectID,
    public readonly day: string,
    private readonly state: Map<ProjectStatisticsKey, number>,
  ) {
  }

  incrementRegistered(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_registered`);
  }

  incrementUnregistered(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_unregistered`);
  }

  private incrementByKey(key: ProjectStatisticsKey): void {
    if (!this.state.has(key)) {
      this.state.set(key, 0);
    }

    this.state.set(key, this.state.get(key)! + 1);
  }

  serializeState(): Record<ProjectStatisticsKey, number> {
    const results: Record<ProjectStatisticsKey, number> = {};

    for (const [key, val] of this.state.entries()) {
      results[key] = val;
    }

    return results;
  }

  valueOf(): IProjectStatistics {
    return {
      id: this.id,
      day: this.day,
      data: this.serializeState(),
    };
  }
}
