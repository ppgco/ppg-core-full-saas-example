import { CampaignSummaryDTO } from "../domain/application/project/commands/get_project.ts";
import { sumAll } from "./utils.tsx";

interface CampaignsProps {
  projectId: string;
  campaigns: CampaignSummaryDTO[];
}

export default function Campaigns(props: CampaignsProps) {
  if (!props.campaigns?.length) {
    return <p>No campaigns</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Icon</th>
          <th>Title</th>
          <th>Content</th>
          <th>Statistics</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.campaigns.map((item) => (
          <tr key={item.meta.id}>
            <td><img src={item.meta.icon} height={64} width={64}/></td>
            <td>{item.meta.title}</td>
            <td>{item.meta.content}</td>
            <td>
              Sent: {sumAll("sent", item.stats.data)} / Delivered:{" "}
              {sumAll("delivered", item.stats.data)} / Clicked:{" "}
              {sumAll("click", item.stats.data)}
            </td>
            <td>
              <a
                href={`/projects/${props.projectId}/campaigns/${item.meta.id}`}
              >
                <button>
                  Show
                </button>
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
