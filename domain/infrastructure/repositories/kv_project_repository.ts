import { IProject, Project } from "../../model/project/project.ts";
import { IProjectRepository } from "../../model/project/project_repository.ts";

export class KVProjectRepository implements IProjectRepository {
  static DB_NAMESPACE = "project";

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

  async all(): Promise<Project[]> {
    const kv = await this.cachedKvPromise;
    const results = [];
    for await (
      const item of kv.list<IProject>({
        prefix: [KVProjectRepository.DB_NAMESPACE],
      })
    ) {
      results.push(Project.fromPlain(item.value));
    }
    return results;
  }

  async save(project: Project): Promise<void> {
    const kv = await this.cachedKvPromise;
    const plainData = project.valueOf();
    const result = await kv.set([
      KVProjectRepository.DB_NAMESPACE,
      plainData.id,
    ], plainData);
    if (!result.ok) {
      throw new Error(
        "Problem during writing data to KV - data may be corrupted",
      );
    }
  }

  async get(projectId: string): Promise<Project> {
    const kv = await this.cachedKvPromise;
    const result = await kv.get<IProject>([
      KVProjectRepository.DB_NAMESPACE,
      projectId,
    ]);

    if (!result || !result.value) {
      throw new Error("Project not found");
    }

    return Project.fromPlain(result.value as IProject);
  }
}
