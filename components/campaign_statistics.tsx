import { ChartColors } from "https://deno.land/x/fresh_charts@0.3.1/utils.ts";
import { ICampaignStatistics } from "../domain/model/project/campaign/campaign_statistics/campaign_statistics.ts";
import { Chart } from "../islands/chart.tsx";
import { sumAll } from "./utils.tsx";

interface CampaignStatisticsProps {
  stats: ICampaignStatistics;
}

export default function CampaignStatistics(props: CampaignStatisticsProps) {
  if (!props.stats) {
    return <p>No statistics data</p>;
  }

  return (
    <div style="width: 450px">
      <Chart
        type="pie"
        options={{ devicePixelRatio: 1 }}
        data={{
          labels: ["Sent", "Delivered", "Clicked"],
          datasets: [
            {
              label: "Sum",
              data: [
                sumAll("sent", props.stats.data),
                sumAll("delivered", props.stats.data),
                sumAll("click", props.stats.data),
              ],
              backgroundColor: [
                ChartColors.Blue,
                ChartColors.Green,
                ChartColors.Red,
              ],
            },
          ],
        }}
      />
    </div>
  );
}
