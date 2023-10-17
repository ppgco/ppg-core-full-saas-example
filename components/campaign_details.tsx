import { ICampaign } from "../domain/model/project/campaign/campaign.ts";

interface CampaignDetailsProps {
  meta: ICampaign;
}

export default function CampaignDetails(props: CampaignDetailsProps) {
  if (!props.meta) {
    return <p>No metadata</p>;
  }

  return (
    <>
      <p>ID: {props.meta.id}</p>
      <p>Title: {props.meta.title}</p>
      <p>Content: {props.meta.content}</p>
      <p>Icon: {props.meta.icon}</p>
      <p>Icon preview: <img src={props.meta.icon} width={150} height={150}></img></p>
    </>
  );
}
