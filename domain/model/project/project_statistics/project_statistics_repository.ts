import { YYYYMMDD } from "../../../utils/day.ts";
import { IStoppable } from "../../stoppable.ts";
import { ProjectID } from "../project.ts";
import { ProjectStatistics } from "../project_statistics/project_statistics.ts";

export interface IProjectStatisticsRepository extends IStoppable {
  save(projectId: ProjectID, statistics: ProjectStatistics): Promise<void>;
  get(projectId: ProjectID): Promise<ProjectStatistics[]>;
  getForDay(projectId: ProjectID, day: YYYYMMDD): Promise<ProjectStatistics>;
}
