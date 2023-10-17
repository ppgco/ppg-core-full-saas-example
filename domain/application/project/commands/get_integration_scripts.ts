import { ProjectID } from "../../../model/project/project.ts";

export class GetIntegrationScriptsCommand {
  constructor(
    public readonly projectId: ProjectID,
  ) {
  }
}

export class GetIntegrationScriptsResponse {
  constructor(
    public readonly projectScript: string,
    public readonly workerScript: string,
    public readonly integrationCode: string,
    public readonly workerCode: string,
  ) {
  }
}
