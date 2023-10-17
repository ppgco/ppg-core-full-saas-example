import { ProjectID, ProjectName } from "../../../model/project/project.ts";

export class GetProjectsCommand {
  constructor() {
  }
}

export class GetProjectDetails {
  constructor(
    public readonly id: ProjectID,
    public readonly name: ProjectName,
  ) {
  }
}

export class GetProjectsResponse {
  constructor(
    public readonly projects: GetProjectDetails[],
  ) {
  }
}
