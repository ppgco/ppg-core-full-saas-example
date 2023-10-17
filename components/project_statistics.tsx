import { IProjectStatistics } from "../domain/model/project/project_statistics/project_statistics.ts";
import { Chart } from "../islands/chart.tsx";

interface ProjectStatisticsProps {
  data: IProjectStatistics[];
}

export default function ProjectStatistics(props: ProjectStatisticsProps) {
  if (!props.data?.length) {
    return <p>No activity data</p>;
  }

  const availableKeys: Set<string> = new Set();
  const days: Set<string> = new Set();
  const data: Map<string, Record<string, number>> = new Map();

  for (const item of props.data || []) {
    for (const key of Object.keys(item.data)) {
      availableKeys.add(key);
      data.set(item.day, item.data);
    }
    days.add(item.day);
  }

  return (
    <div style="width: 650px; height: 250px">
      <Chart
        type="line"
        options={{
          scales: { y: { beginAtZero: true } },
        }}
        data={{
          labels: [...days],
          datasets: [...availableKeys].map((keyName: string) => {
            return {
              label: keyName as string,
              data: [...days].map((day) => {
                const value = data.get(day) || {};
                return value[keyName as string] as number || 0;
              }),
            };
          }),
        }}
      />
    </div>
  );
}
