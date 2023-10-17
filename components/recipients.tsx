import { IRecipient } from "../domain/model/project/recipient/recipient.ts";

interface RecipientsProps {
  recipients: IRecipient[];
}

export default function Recipients(props: RecipientsProps) {
  if (!props.recipients?.length) {
    return <p>No recipients</p>;
  }

  return  <table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    {props.recipients.map((item) => (
      <tr>
        <td>{item.id}</td>
        <td>{item.provider}</td>
      </tr>
    ))}
  </tbody>
</table>;
}
