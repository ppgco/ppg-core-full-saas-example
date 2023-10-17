import { YYYYMMDD } from "../../utils/day.ts";
import { ProjectID } from "../../model/project/project.ts";
import {
  IProjectStatistics,
  ProjectStatistics,
} from "../../model/project/project_statistics/project_statistics.ts";
import { IProjectStatisticsRepository } from "../../model/project/project_statistics/project_statistics_repository.ts";

export class KVProjectStatisticsRepository
  implements IProjectStatisticsRepository {
  static DB_NAMESPACE = "project_statistics";

  public cachedKvPromise: Promise<Deno.Kv>;

  constructor(persistence: boolean) {
    this.cachedKvPromise = Deno.openKv(
      persistence
        ? `data/${this.constructor.name}`
        : `/tmp/${this.constructor.name}_${Math.random()}`,
    );
  }

  async stop(): Promise<void> {
    const kv = await this.cachedKvPromise;
    return kv.close();
  }

  async save(
    projectId: ProjectID,
    statistics: ProjectStatistics,
  ): Promise<void> {
    const kv = await this.cachedKvPromise;
    const plainData = statistics.valueOf();
    const result = await kv.set([
      KVProjectStatisticsRepository.DB_NAMESPACE,
      projectId,
      plainData.day,
    ], plainData);

    if (!result.ok) {
      throw new Error(
        "Problem during writing data to KV - data may be corrupted",
      );
    }
  }

  async get(projectId: ProjectID): Promise<ProjectStatistics[]> {
    const results: ProjectStatistics[] = [];
    const kv = await this.cachedKvPromise;
    for await (
      const item of kv.list<IProjectStatistics>({
        prefix: [KVProjectStatisticsRepository.DB_NAMESPACE, projectId],
      })
    ) {
      results.push(
        ProjectStatistics.fromPlain(item.value),
      );
    }
    return results;
  }

  async getForDay(
    projectId: ProjectID,
    day: YYYYMMDD,
  ): Promise<ProjectStatistics> {
    const kv = await this.cachedKvPromise;

    const result = await kv.get<IProjectStatistics>([
      KVProjectStatisticsRepository.DB_NAMESPACE,
      projectId,
      day,
    ]);

    if (!result || !result.value) {
      return new ProjectStatistics(
        projectId,
        day,
        new Map(),
      );
    }

    return ProjectStatistics.fromPlain(result.value);
  }
}
