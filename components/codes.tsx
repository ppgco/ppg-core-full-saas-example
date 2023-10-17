import { GetIntegrationScriptsResponse } from "../domain/application/project/commands/get_integration_scripts.ts";

interface IntegrationCodesProps {
  codes: GetIntegrationScriptsResponse;
}

export default function IntegrationCodes(props: IntegrationCodesProps) {
  const { codes } = props;
  return (
    <>
      <details>
        <summary>Website code snippet</summary>
        <pre>
          {codes.integrationCode}
        </pre>
      </details>
      <details>
        <summary>
          Service Worker code - place this in /worker.js at root path
        </summary>
        <pre>
        {codes.workerCode}
        </pre>
      </details>
    </>
  );
}
