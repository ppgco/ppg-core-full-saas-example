import { IStoppable } from "../stoppable.ts";
import { Project, ProjectID } from "./project.ts";

export interface IProjectRepository extends IStoppable {
  save(project: Project): Promise<void>;
  all(): Promise<Project[]>;
  get(projectId: ProjectID): Promise<Project>;
}
