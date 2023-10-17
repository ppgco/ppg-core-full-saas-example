import { useState } from "preact/hooks";

export default function CampaignForm() {

  const [imageSrc, setImageSrc] = useState("https://placehold.jp/150x150.png")

  return (
    <form method="post">
      <table>
      <tr>
          <td>Title</td>
          <td><input type="text" name="title" value="Sample title" /></td>
        </tr>
        <tr>
          <td>Content</td>
          <td><input type="text" name="content" value="Sample content" /></td>
        </tr>
        <tr>
          <td>Icon</td>
          <td><input type="text" name="icon" value={imageSrc} onChange={(event) => {setImageSrc(event.currentTarget.value)}} /></td>
        </tr>
        <tr>
          <td>Icon preview</td>
          <td><img src={imageSrc} width={160} height={160}/></td>
        </tr>
        <tr>
          <td></td>
          <td><button type="submit">Send!</button></td>
        </tr>
      </table>
    </form>
  );
}