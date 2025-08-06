export const topChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          const index = tooltipItems[0].dataIndex;
          return `Week ${index}`;
        },
      },
    },
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Total % of Teams Remaining",
      font: {
        size: 20, // Title font size
      },
      color: 'black',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return `${value}%`; // Format y-axis ticks as percentages
        },
        font: {
          size: 20, // Change this value to adjust X-axis label font size
        },
        color: 'black',
      },
      title: {
        display: true,
        text: "% Remaining",
        color: "#b00000",
        font: {
          size: 20,
          weight: "bold",
        },
      },
    },
    x: {
      ticks: {
        font: {
          size: 20, // Change this value to adjust X-axis label font size
        },
        color: 'black',
      },
      title: {
        display: true,
        font: {
          size: 20, // <-- font size for axis title
        },
        color: 'black',
      },
    },
  },
};

export const bottomChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          const index = tooltipItems[0].dataIndex;
          return `Week ${index + 1}`;
        },
      },
    },
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "% of Teams Eliminated Each Week",
      font: {
        size: 20, // Title font size
      },
      color: 'black',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return `${value}%`; // Format y-axis ticks as percentages
        },
        font: {
          size: 20, // Change this value to adjust X-axis label font size
        },
        color: 'black',
      },
      title: {
        display: true,
        text: "% Eliminated",
        color: "#b00000",
        font: {
          size: 20,
          weight: "bold",
        },
      },
    },
    x: {
      ticks: {
        font: {
          size: 20, // Change this value to adjust X-axis label font size
        },
        color: 'black',
      },
      title: {
        display: true,
        font: {
          size: 20, // <-- font size for axis title
        },
        color: 'black',
      },
    },
  },
};

export const table_columns = [
  {
    title: "Pick",
    render: (_, record) => (
      <div>
        <span className="bold-team-name">{`${
          record.isAway
            ? record.team2.replace("@", "")
            : record.team1.replace("@", "")
        }`}</span>{" "}
        {`vs ${record.isAway ? record.team1 : record.team2}`}
      </div>
    ),
  },
  {
    title: "Score",
    render: (_, record) => (
      <div>{`${record.isAway ? record.AwayScore : record.HomeScore} vs ${
        record.isAway ? record.HomeScore : record.AwayScore
      }`}</div>
    ),
  },
  {
    title: "Week",
    dataIndex: "week",
  },
  {
    title: "W%",
    dataIndex: "win_probability",
    render: (value) => `${value}%`,
  },
  {
    title: "P%",
    dataIndex: "p_percent",
    render: (value) => `${value}%`,
  },
];
