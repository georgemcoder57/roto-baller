import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { isMobile } from "react-device-detect";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register required components
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  Title
);

import "./App.css";
import { API } from "./services/ApiService";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Switch,
  Modal,
  notification,
  Popconfirm,
  Spin,
  Flex,
  Table,
} from "antd";
import Calendar from "./assets/calendar.png";
import MenuIcon from "./assets/menu.png";
import {
  AppTitle,
  AppWrapper,
  EntryButtons,
  EntryTitle,
  FilterButtons,
  FilterWrapper,
  GridWrapper,
  Links,
  PanelWrapper,
  TeamsUsedTitle,
  ToolOutline,
  ToolText,
  TopWrapper,
} from "./styles";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const [topChartData, setTopChartData] = useState();
  const [bottomChartData, setBottomChartData] = useState();
  const [topUpsetsByWin, setTopUpsetsByWin] = useState([]);
  const [topUpsetsByPick, setTopUpsetsByPick] = useState([]);
  const [sortedByPointData, setSortedByPointData] = useState();
  const topChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return `Week ${index}`;
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total % of Teams remaining',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `${value}%`; // Format y-axis ticks as percentages
          }
        },
        title: {
          display: true,
          text: '% Remaining',
          color: '#b00000',
          font: {
            size: 14,
            weight: 'bold',
          },
        }
      }
    }
  };
  const bottomChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return `Week ${index + 1}`;
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '% of teams eliminated each week',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `${value}%`; // Format y-axis ticks as percentages
          }
        },
        title: {
          display: true,
          text: '% Eliminated',
          color: '#b00000',
          font: {
            size: 14,
            weight: 'bold',
          },
        }
      }
    }
  };
  const table_columns = [
  {
    title: 'Pick',
    render: (value, record) => <div><span className="bold-team-name">{`${record.isAway ? record.team2.replace('@', '') : record.team1.replace('@', '')}`}</span> {`vs ${record.isAway ? record.team1 : record.team2}`}</div> 
  },
  {
    title: 'Score',
    render: (value, record) => <div>{`${record.isAway ? record.AwayScore : record.HomeScore} vs ${record.isAway ? record.HomeScore : record.AwayScore}`}</div> 
  },
  {
    title: 'Week',
    dataIndex: 'week',
  },
  {
    title: 'W%',
    dataIndex: 'win_probability',
    render: (value) => `${value}%`,
  },
  {
    title: 'P%',
    dataIndex: 'p_percent',
    render: (value) => `${value}%`,
  },
];

  const [openSaveError, setOpenSaveError] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [showAllSettings, setShowAllSettings] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [loadedEntries, setLoadedEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    id: "",
    name: "",
    doublePicksStart: 0,
    clicked_cells: [],
    teams_used: [],
    hide_on_grid: false,
    week: 1,
  });
  const [pickData, setPickData] = useState(null);
  const [winData, setWinData] = useState(null);
  const [sortModel, setSortModel] = useState();
  const [loggedUser, setLoggedUser] = useState();
  // const [loggedUser, setLoggedUser] = useState({
  //   logged_in: true,
  //   user: {
  //       id: 132865,
  //       name: "George Coder",
  //       email: "GeorgeMCoder57@gmail.com"
  //   }
  // });
  const [currentWeek, setCurrentWeek] = useState();
  const [fullWeeks, setFullWeeks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState({
    text: 'Loading...',
    loading: false,
  });
  const [rowData, setRowData] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showOptions, setShowOptions] = useState({
    away: true,
    divisional: true,
    thursday: true,
    monday: true,
    spreads: true,
  });

  useEffect(() => {
    fetchLoginInfo();
  }, []);

  useEffect(() => {
    fetchTeamMemberList();
  }, []);

  useEffect(() => {
    if (loggedUser?.logged_in === true) {
      handleLoadEntry();
    }
  }, [loggedUser]);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchFullWeekSchedule();
      fetchLoginInfo();
    }
  }, [teamMembers]);

  useEffect(() => {
    if (currentWeek) {
      fetchScoreData();
    }
  }, [currentWeek]);

  useEffect(() => {
    if (scoreData && scoreData.length > 0 && sortedByPointData && sortedByPointData.length > 0) {
      handleBuildTables();
    }
  }, [scoreData, sortedByPointData])

  const handleBuildTables = () => {
    const filterLostGames = sortedByPointData.filter((item, index) => {
      const targetScore = scoreData.find((score) => score.GameKey === item.game_key && score.ScoreID === item.score_id);
      if (targetScore) {
        const isHome = targetScore.HomeTeam === item.team1;
        const home_score = targetScore.HomeScore;
        const away_score = targetScore.AwayScore;
        const isLost = isHome
        ? home_score < away_score
        : away_score < home_score;
        item.HomeScore = home_score;
        item.AwayScore = away_score;
        item.key = index;

        return isLost === true;
      }
      return false;
    }).sort((a, b) => b.win_probability - a.win_probability).slice(0, 10);

    setTopUpsetsByWin(filterLostGames);
    const sortedByPick = filterLostGames.sort((a, b) => b.p_percent - a.p_percent);
    setTopUpsetsByPick(sortedByPick);

    console.log('filterLostGames', filterLostGames);
  }

  const filteredData = useMemo(() => {
    let customData = [...rowData];

    if (pickData && pickData.results.length > 0) {
      customData = customData.map((item) => {
        const targetPickItem = pickData.results.find(
          (pickItem) => pickItem.team === item.name
        );

        if (targetPickItem) {
          return {
            ...item,
            p_percent: targetPickItem.percentage,
          };
        }

        return item;
      });
    }

    if (winData && winData.results.length > 0) {
      customData = customData.map((item) => {
        const targetWinItem = winData.results.find(
          (winItem) => winItem.abbreviation === item.name
        );

        if (targetWinItem) {
          return {
            ...item,
            win_probability: targetWinItem.winProbability || 0,
          };
        }

        return item;
      });
    }

    if (currentEntry.hide_on_grid) {
      customData = customData.filter(
        (item) => !currentEntry.teams_used.includes(item.name)
      );
    }

    if (sortModel?.length > 0) {
      const { colId, sort } = sortModel[0];
      customData.sort((a, b) => {
        if (colId.includes('week')) {
          if (parseFloat(a[colId].point) < parseFloat(b[colId].point)) return sort === 'asc' ? -1 : 1;
          if (parseFloat(a[colId].point) > parseFloat(b[colId].point)) return sort === 'asc' ? 1 : -1;
          return 0;
        } else {
          if (a[colId] < b[colId]) return sort === 'asc' ? -1 : 1;
          if (a[colId] > b[colId]) return sort === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    if (customData && customData.length > 0 && 'p_percent' in customData[0] && 'win_probability' in customData[0]) {
      const sortedGames = customData.flatMap(teamObj => {
        return Object.entries(teamObj)
          .filter(([key, value]) => /^week\d+$/.test(key) && value && value.name !== 'BYE')
          .map(([week, game]) => {
            return ({
            ...game,
            week: Number(week.replace(/\D/g, '')),
            team1: teamObj.name,
            team2: game.name,
            win_probability: teamObj.win_probability,
            p_percent: customData.find((item) => item.name === game.name.replace('@', '')).p_percent,
            point: Number(game.point)
          })
          });
      })
      .sort((a, b) => b.point - a.point)
      setSortedByPointData(sortedGames);
    }

    return customData;
  }, [
    currentEntry.hide_on_grid,
    rowData,
    currentEntry.teams_used,
    pickData,
    winData,
    sortModel
  ]);

  useEffect(() => {
    reCalculateClickedCells();
  }, [filteredData]);

  const reCalculateClickedCells = () => {
    const customClickedCells = [...currentEntry.clicked_cells];
    customClickedCells.forEach((item) => {
      const targetRowIndex = filteredData.findIndex((rowItem) => rowItem.name === item.team);
      if (targetRowIndex > -1) {
        item.rowIndex = targetRowIndex;
      }
    });
    setCurrentEntry({
      ...currentEntry,
      clicked_cells: customClickedCells
    })
  }

  useEffect(() => {
    if (scoreData?.length > 0) {
      handleKnockoutStats();
    }
  }, [scoreData]);

  const handleKnockoutStats = () => {
    const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
    const lossPercentages = [];
    const lossPercentagesByWeek = [];
    const totalPicks = loadedEntries.flatMap((entry) => entry.clicked_cells);
    
    if (totalPicks.length > 0) {
      weeks.forEach((week) => {
        const picksForWeek = totalPicks.filter(pick => pick.week === week);
        let lostCount = 0;

        if (picksForWeek.length > 0) {
          picksForWeek.forEach((pick) => {
            const targetScore = scoreData.find((item) => item.GameKey === pick.game_key && item.ScoreID === pick.score_id);
            if (!targetScore) return;
            const isHome = targetScore.HomeTeam === pick.team;
            const home_score = targetScore.HomeScore;
            const away_score = targetScore.AwayScore;
            const isLost = isHome
            ? home_score < away_score
            : away_score < home_score;
            
            if (isLost) lostCount++;
          })
        }

        const total = picksForWeek.length;
        const lossPercent = (lostCount / totalPicks.length) * 100;
        const lossPercentByWeek = total > 0 ? (lostCount / total) * 100 : 0;

        lossPercentages.push(lossPercent);
        lossPercentagesByWeek.push(lossPercentByWeek);
      });

      let topChartData = {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        datasets: [
          {
            id: 0,
            borderColor: '#3366cc',
            backgroundColor: '#7893c9',
            fill: true,
            label: '% Remaining',
            data: [100, ...lossPercentages]
          }
        ]
      };

      let bottomChartData = {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        datasets: [
          {
            id: 0,
            borderColor: '#3366cc',
            backgroundColor: '#7893c9',
            fill: true,
            label: '% Eliminated',
            data: lossPercentagesByWeek
          }
        ]
      };
      setTopChartData(topChartData);
      setBottomChartData(bottomChartData);
    }
  }

  const fetchLoginInfo = () => {
    // return;
    fetch(WP_API.root + "custom/v1/user-status", {
      method: "GET",
      headers: {
        "X-WP-Nonce": WP_API.nonce,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("loading user", data);
        setLoggedUser(data);
      });
  };

  const getBackgroundColor = (cellData) => {
    const point = cellData.point;
    if (point > -3) {
      return "#fdfffd";
    } else if (point > -10 && point <= -3) {
      // Gradient range: map point from [-10, -3] to [0, 1]
      const t = (-3 - point) / 7; // 0 at -3, 1 at -10

      // Interpolate between #fdfffd and #4cff4c
      const startColor = [253, 255, 253]; // RGB of #fdfffd
      const endColor = [76, 255, 76]; // RGB of #4cff4c

      const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
      const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
      const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);

      const backgroundColor = `rgb(${r}, ${g}, ${b})`;

      return backgroundColor;
    } else if (point <= -10) {
      return "#4cff4c";
    }
  };
  const getClassName = (cellData) => {
    const cellDate = new Date(cellData.dateTime);
    let className = "show-spreads";

    // getDay() returns 1 for Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const isMonday = cellDate.getDay() === 1;
    const isThursday = cellDate.getDay() === 4;

    if (!showOptions.spreads) {
      className = "hide-spreads";
    }

    if (cellData.isAway) {
      className += showOptions.away ? "" : " gray";
    }

    if (isMonday) {
      className += showOptions.monday ? "" : " gray";
    }

    if (isThursday) {
      className += showOptions.thursday ? "" : " gray";
    }

    if (cellData.type === "sd") {
      className += showOptions.divisional ? "" : " gray";
    }

    return className;
  };

  const getCellClass = (params) => {
    if (
      currentEntry.clicked_cells.find(
        (item) =>
          item.colId === params.colDef.field &&
          item.rowIndex === params.rowIndex
      )
    ) {
      return "cell-selected";
    }

    // if (
    //   currentEntry.doublePicksStart > 0 &&
    //   parseInt(params.colDef.field.replace(/\D/g, ""), 10) >=
    //     currentEntry.doublePicksStart
    // ) {
    //   if (
    //     currentEntry.clicked_cells.find(
    //       (item) =>
    //         item.colId === params.colDef.field &&
    //         params.rowIndex !== item.rowindex
    //     )
    //   ) {
    //     return "fake-disabled";
    //   }
    // }

    return "";
  };

  const customColDefs = useMemo(() => {
    if (!currentWeek) {
      return;
    }
    const weekCols = Array.from({ length: 18 }, (_, i) => i + 1)
      .filter((weekNum) => weekNum >= currentWeek.value)
      .map((weekNum) => ({
        headerName: `${weekNum}`,
        field: `week${weekNum}`,
        cellClass: (params) => getCellClass(params),
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
        },
        sortable: true,
        comparator: (nodeA, nodeB) => {
          const pointA = parseFloat(nodeA.point) ?? 0;
          const pointB = parseFloat(nodeB.point) ?? 0;
          return pointA - pointB;
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isSameRow = currentEntry.clicked_cells.find(
            (item) => item.rowIndex === node.rowIndex
          );
          const isSameCol = currentEntry.clicked_cells.find(
            (item) =>
              item.colId === colDef.field && node.rowIndex !== item.rowindex
          );
          const isCurrentCell = currentEntry.clicked_cells.find(
            (item) =>
              node.rowIndex === item.rowIndex && colDef.field === item.colId
          );
          const doubled = currentEntry.doublePicksStart > 0 && parseInt(colDef.field.replace(/\D/g, ""), 10) >= currentEntry.doublePicksStart;
          const hasDoubledItems = currentEntry.clicked_cells.filter((item) => item.week >= currentEntry.doublePicksStart && item.colId === colDef.field);

          return (
            <div
              className={getClassName(props.data[`week${weekNum}`])}
              style={{
                backgroundColor: getBackgroundColor(
                  props.data[`week${weekNum}`]
                ),
              }}
            >
              {currentEntry.teams_used.includes(props.data.name) && (
                <div className="red-bar-horizontal" />
              )}
              {!isCurrentCell && isSameRow && (
                <div className="red-bar-horizontal" />
              )}
              {!isCurrentCell && isSameCol && (doubled ? hasDoubledItems.length === 2 : hasDoubledItems.length >= 0) && <div className={`red-bar`} />}
              <div className="name-value">
                {props.data[`week${weekNum}`].name}
              </div>
              <div className="point-value">
                {`${
                  props.data[`week${weekNum}`].point
                    ? props.data[`week${weekNum}`].point > 0
                      ? `+${props.data[`week${weekNum}`].point}`
                      : props.data[`week${weekNum}`].point
                    : ""
                }`}
              </div>
            </div>
          );
        },
        width: 66,
        minWidth: isMobile ? 86 : 60,
        flex: 1,
      }));

    if (
      window.location.href.includes(
        "survivor-pool-aggregate-consensus-picks-and-data"
      )
    ) {
      return [
        {
          field: "name",
          headerName: "Team",
          width: 80,
          sortable: false,
          cellClassRules: {
            "first-col-highlight": (params) => params.node.isSelected(),
          },
          cellRenderer: (props) => {
            return (
              <div
                className={`team-name ${
                  currentEntry.teams_used.includes(props.value)
                    ? "cell-selected"
                    : ""
                }`}
              >
                {props.value}
              </div>
            );
          },
          flex: 1,
        },
        {
          field: "p_percent",
          headerName: "P%",
          headerTooltip:
            "Percentage that each team is picked in a given week, based on all RotoBaller Survivor Tool users. Resets Thursday morning.",
          sortable: true,
          comparator: (valueA, valueB) => {
            return valueA - valueB;
          },
          cellClassRules: {
            "cell-disabled": (params) => isDisabled(params),
          },
          cellRenderer: (props) => {
            return <div className="pick-percent">{`${props.value}%`}</div>;
          },
          flex: 1,
          minWidth: isMobile ? 66 : 56,
        },
      ];
    }
    return [
      {
        field: "name",
        headerName: "Team",
        width: 80,
        sortable: false,
        cellClassRules: {
          "first-col-highlight": (params) => params.node.isSelected(),
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isSameRow = currentEntry.clicked_cells.find(
            (item) => item.rowIndex === node.rowIndex
          );
          const isCurrentCell = currentEntry.clicked_cells.find(
            (item) =>
              node.rowIndex === item.rowIndex && colDef.field === item.colId
          );

          return (
            <div
              className={`team-name ${
                currentEntry.teams_used.includes(props.value)
                  ? "cell-selected"
                  : ""
              }`}
            >
              {currentEntry.teams_used.includes(props.value) && (
                <div className="red-bar-horizontal" />
              )}
              {!isCurrentCell && isSameRow && (
                <div className="red-bar-horizontal" />
              )}
              {props.value}
            </div>
          );
        },
        flex: 1,
        pinned: "left",
      },
      // { field: "ev", headerName: "EV", width: 56, flex: 1 },
      {
        field: "win_probability",
        headerName: "W%",
        headerTooltip:
          "RotoBaller's Projected win probability for a given game. Win probability provided for current week and next week.",
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
        },
        sortable: true,
        comparator: (valueA, valueB) => {
          return valueA - valueB;
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isSameRow = currentEntry.clicked_cells.find(
            (item) => item.rowIndex === node.rowIndex
          );
          const isCurrentCell = currentEntry.clicked_cells.find(
            (item) =>
              node.rowIndex === item.rowIndex && colDef.field === item.colId
          );

          return (
            <div className="win-percent">
              {currentEntry.teams_used.includes(props.data.name) && (
                <div className="red-bar-horizontal" />
              )}
              {!isCurrentCell && isSameRow && (
                <div className="red-bar-horizontal" />
              )}
              {`${props.value}%`}
            </div>
          );
        },
        width: 56,
        flex: 1,
        pinned: "left",
        minWidth: isMobile ? 66 : 56,
      },
      {
        field: "p_percent",
        headerName: "P%",
        headerTooltip:
          "Percentage that each team is picked in a given week, based on all RotoBaller Survivor Tool users. Resets Thursday morning.",
        sortable: true,
        comparator: (valueA, valueB) => {
          return valueA - valueB;
        },
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isSameRow = currentEntry.clicked_cells.find(
            (item) => item.rowIndex === node.rowIndex
          );
          const isCurrentCell = currentEntry.clicked_cells.find(
            (item) =>
              node.rowIndex === item.rowIndex && colDef.field === item.colId
          );

          return (
            <div className="pick-percent">
              {currentEntry.teams_used.includes(props.data.name) && (
                <div className="red-bar-horizontal" />
              )}
              {!isCurrentCell && isSameRow && (
                <div className="red-bar-horizontal" />
              )}
              {`${props.value}%`}
            </div>
          );
        },
        width: 56,
        flex: 1,
        minWidth: isMobile ? 66 : 56,
      },
      ...weekCols,
    ];
  }, [showOptions, currentWeek, currentEntry, isMobile, window.location.href]);

  const fetchScoreData = async () => {
    try {
      setLoadingStatus({
        text: 'Loading score data',
        loading: true,
      });
      const { data } = await API.get(`/score-data/${currentWeek.value}`);
      setScoreData(data);
      setLoadingStatus({
        text: 'Score data loaded',
        loading: false,
      });
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Failed to load score data.',
        loading: false,
      });
    }
  }

  const fetchTeamMemberList = async () => {
    setLoadingStatus({
      text: 'Loading team member list',
      loading: true,
    })
    try {
      const { data } = await API.get("/team-member-list");
      setTeamMembers(data);
      setLoadingStatus({
        text: 'Team member list loaded',
        loading: false,
      });
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Failed to load team member list',
        loading: false,
      });
    }
  };

  const transformWeeklySchedule = (weekly_data) => {
    return weekly_data.reduce((teams, game) => {
      // process home team
      let hometeam = teams.find((t) => t.id === game.GlobalHomeTeamID);
      if (!hometeam) {
        // first time, create the team and add it
        const team = {
          id: game.GlobalHomeTeamID,
          name: game.HomeTeam,
          ev: 0,
          win_probability: 0, // this is from the implied win probability api
          p_percent: 0, // coming from a google spreadsheet (see video of chat) calculated every week on a tuesday (formula unkown)
          games: [game],
        };
        teams = [...teams, team];
      } else {
        hometeam.games = [...hometeam.games, game].sort((a, b) => {
          return a.Week - b.Week;
        });
      }

      let awayteam = teams.find((t) => t.id === game.GlobalAwayTeamID);
      if (!awayteam && game.AwayTeam !== "BYE") {
        // first time, create the team and add it
        const team = {
          id: game.GlobalAwayTeamID,
          name: game.AwayTeam,
          ev: 0,
          win_probability: 0, // this is from the implied win probability api
          p_percent: 0, // coming from a google spreadsheet (see video of chat) calculated every week on a tuesday (formula unkown)
          games: [game],
        };
        teams = [...teams, team];
      } else if (awayteam) {
        awayteam.games = [...awayteam.games, game].sort((a, b) => {
          return a.Week - b.Week;
        });
      }
      return teams.sort((a, b) => {
        return a.id - b.id;
      });
    }, []);
  };

  const fetchFullWeekSchedule = async () => {
    try {
      setLoadingStatus({
        text: 'Loading full week schedule',
        loading: true,
      });
      const { data } = await API.get("/full-weeks-schedule");

      const transformedData = transformWeeklySchedule(data);
      const customWeeks = transformedData
        .reduce((weeks, team) => {
          team.games.forEach((game) => {
            if (!weeks || !weeks.find((w) => w.value === game.Week))
              weeks = [
                ...weeks,
                {
                  label: "Week " + game.Week.toString(),
                  value: game.Week,
                },
              ];
          });
          return weeks;
        }, [])
        .sort((a, b) => {
          return a.value - b.value;
        });
      setFullWeeks(customWeeks);
      setCurrentWeek(customWeeks[0]);

      let customRows = [];
      transformedData.forEach((team) => {
        let row = {};
        row.name = team.name;
        row.ev = team.ev;
        row.win_probability = team.win_probability;
        row.p_percent = team.p_percent;

        // For each week
        team.games.forEach((game) => {
          row[`week${game.Week}`] = {};
          if (game.GlobalHomeTeamID !== team.id) {
            row[`week${game.Week}`].name = "@" + game.HomeTeam;
            row[`week${game.Week}`].point = (-game.PointSpread || 0).toString(); // point spread is referring to home team
            row[`week${game.Week}`].isAway = true;
          } else if (game.AwayTeam == "BYE") {
            // a "BYE" in not a game + no teams called "BYE"
            row[`week${game.Week}`].name = "BYE";
            row[`week${game.Week}`].isAway = false;
          } else {
            row[`week${game.Week}`].name = game.AwayTeam;
            row[`week${game.Week}`].point = (game.PointSpread || 0).toString(); // point spread is referring to away team
            row[`week${game.Week}`].isAway = false;
          }

          row[`week${game.Week}`].game_key = game.GameKey;
          row[`week${game.Week}`].score_id = game.ScoreID;
          row[`week${game.Week}`].dateTime = game.DateTime;

          if (game.AwayTeam !== "BYE") {
            const homeTeamInfo = teamMembers.find((t) => t.TeamID === team.id);
            let awayTeamInfo = teamMembers.find(
              (t) => t.TeamID === game.GlobalAwayTeamID
            );
            if (team.id !== game.GlobalHomeTeamID) {
              awayTeamInfo = teamMembers.find(
                (t) => t.TeamID === game.GlobalHomeTeamID
              );
            }

            if (homeTeamInfo && awayTeamInfo) {
              if (
                homeTeamInfo.Division === awayTeamInfo.Division &&
                homeTeamInfo.Conference === awayTeamInfo.Conference
              )
                row[`week${game.Week}`].type = "sd";
            }
          }
        });
        customRows.push(row);
      });
      setRowData(customRows);
      setLoadingStatus({
        text: 'Full week schedule loaded',
        loading: false,
      });
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Failed to load full week schedule',
        loading: false,
      });
    }
  };

  const handleChangeWeek = (value, option) => {
    setIsDirty(true);
    setCurrentWeek(option);
  };

  const handleToggle = (checked, type) => {
    setShowOptions({
      ...showOptions,
      [type]: checked,
    });
  };

  const handleSaveEntry = async () => {
    if (!loggedUser || loggedUser?.logged_in === false) {
      setOpenSaveError(true);
      return;
    } else {
      try {
        const payload = {
          ...currentEntry,
          week: currentWeek.value,
          user: loggedUser,
        };
        if (
          (loadedEntries.find((item) => item.id === currentEntry.id) &&
            loadedEntries.find((item) => item.id === currentEntry.id).name !==
              currentEntry.name) ||
          !currentEntry.id
        ) {
          const { data } = await API.post("/entry", payload);
          if (data.success) {
            setSaved(true);
            api.success({
              message: "Entry Created",
              description: "Your new entry has been saved successfully.",
              placement: "bottomRight",
            });
            handleLoadEntry();
          }
        } else {
          const { data } = await API.put(`/entry/${currentEntry.id}`, payload);
          if (data.success) {
            setSaved(true);
            api.success({
              message: "Entry Updated",
              description: "Your current entry has been updated successfully.",
              placement: "bottomRight",
            });
            handleLoadEntry();
          }
        }
      } catch (e) {
        console.log(e);
        api.error({
          message: "Failed!",
          description: e.response.data.error,
          placement: "bottomRight",
        });
      }
    }
  };

  const handleLoadEntry = async () => {
    if (loggedUser) {
      setLoadingStatus({
        text: 'Loading saved entries',
        loading: true,
      });
      setLoadedEntries([]);
      setCurrentEntry({
        id: "",
        name: "",
        doublePicksStart: 0,
        clicked_cells: [],
        teams_used: [],
        hide_on_grid: false,
        week: 1,
      });
      try {
        const { data } = await API.get(`/entry/${loggedUser.user.id}`);
        setLoadedEntries(data);

        if (data.length > 0) {
          handleChangeCurrentEntry(null, data[0]);
          setLoadingStatus({
            text: 'Loaded saved entries',
            loading: false,
          });
          // api.success({
          //   message: "Entries Loaded",
          //   description: "All saved entries have been loaded successfully.",
          //   placement: "bottomRight",
          // });
        }
        setIsDirty(false);
      } catch (e) {
        setLoadingStatus({
          text: 'Failed to load saved entries',
          loading: false,
        });
        console.log(e);
      }
    }
  };

  const handleRemoveEntry = async () => {
    try {
      const { data } = await API.delete(`/entry/${currentEntry.id}`);
      if (data.success) {
        api.success({
          message: "Entry Deleted",
          description: "The selected entry has been removed.",
          placement: "bottomRight",
        });
      }
      handleLoadEntry();
    } catch (e) {
      console.log(e);
    }
  };
  const handleClearEntry = () => {
    setCurrentEntry({
      name: "",
      doublePicksStart: 0,
      clicked_cells: [],
      teams_used: [],
      hide_on_grid: false,
      week: 1,
      id: "",
    });
  };

  const handleChangeDoublePicks = (value, option) => {
    setIsDirty(true);
    setCurrentEntry({
      ...currentEntry,
      doublePicksStart: value,
    });
  };

  const handleChangeCurrentEntry = (value, option) => {
    setCurrentEntry(option);
  };

  const handleChangeTeamsUsed = (value, option) => {
    setCurrentEntry({
      ...currentEntry,
      teams_used: value,
    });
    setIsDirty(true);
  };

  const handleChangeHideOnGrid = (e) => {
    setCurrentEntry({
      ...currentEntry,
      hide_on_grid: e.target.checked,
    });
    setIsDirty(true);
  };

  const isDisabled = (params) => {
    if (
      currentEntry.clicked_cells.find(
        (item) =>
          params.rowIndex === item.rowIndex &&
          params.colDef.field === item.colId
      )
    ) {
      return false;
    }
    if (params.value?.name === "BYE") {
      return true;
    }

    if (
      currentEntry.doublePicksStart > 0 &&
      parseInt(params.colDef.field.replace(/\D/g, ""), 10) >=
        currentEntry.doublePicksStart
    ) {
      if (
        currentEntry.clicked_cells.find(
          (item) => item.rowIndex === params.rowIndex
        ) ||
        currentEntry.teams_used.includes(params.data.name)
      ) {
        return true;
      }

      if (
        currentEntry.clicked_cells.find(
          (item) =>
            item.colId === params.colDef.field &&
            params.rowIndex !== item.rowindex
        )
      ) {
        return false;
      }
    } else {
      if (
        currentEntry.clicked_cells.find(
          (item) => item.rowIndex === params.rowIndex
        ) ||
        (currentEntry.teams_used.length > 0 &&
          currentEntry.teams_used.includes(params.data.name)) ||
        currentEntry.clicked_cells.find(
          (item) =>
            item.colId === params.colDef.field &&
            params.rowIndex !== item.rowindex
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const handleCellClick = (event) => {
    const cellData = {
      colId: event.colDef.field,
      rowIndex: event.rowIndex,
      team: event.data.name,
      week: parseInt(event.colDef.field.replace(/\D/g, ""), 10),
      game_key: event.data[event.colDef.field].game_key,
      score_id: event.data[event.colDef.field].score_id,
      isHome: !event.data[event.colDef.field].isAway
    };

    if (event.value.name === "BYE") {
      return;
    }

    if (cellData.colId === "name") {
      return;
      // if (
      //   currentEntry.clicked_cells.find((item) => item.team === cellData.team)
      // ) {
      //   return;
      // }

      // setIsDirty(true);

      // let customTeamsUsed = [...currentEntry.teams_used];
      // if (customTeamsUsed.includes(cellData.team)) {
      //   customTeamsUsed = customTeamsUsed.filter(
      //     (item) => item !== cellData.team
      //   );
      // } else {
      //   customTeamsUsed.push(cellData.team);
      // }
      // setCurrentEntry({
      //   ...currentEntry,
      //   teams_used: customTeamsUsed,
      // });
    }
    if (!cellData.colId.includes("week")) return;

    setIsDirty(true);

    if (currentEntry.doublePicksStart === 0) {
      if (
        !currentEntry.clicked_cells.find(
          (item) => item.colId === cellData.colId
        )
      ) {
        const customclicked_cells = [...currentEntry.clicked_cells];
        customclicked_cells.push(cellData);
        setCurrentEntry({
          ...currentEntry,
          clicked_cells: customclicked_cells,
        });
      } else {
        const customclicked_cells = [...currentEntry.clicked_cells].filter(
          (item) => item.colId !== event.colDef.field
        );
        setCurrentEntry({
          ...currentEntry,
          clicked_cells: customclicked_cells,
        });
      }
      return;
    }
    if (currentEntry.doublePicksStart > 0) {
      // if (cellData.week >= currentEntry.doublePicksStart) {
      if (
        !currentEntry.clicked_cells.find(
          (item) =>
            item.colId === cellData.colId && item.rowIndex === cellData.rowIndex
        )
      ) {
        if (
          currentEntry.clicked_cells.filter(
            (item) => item.colId === cellData.colId
          ).length < 2
        ) {
          const customclicked_cells = [...currentEntry.clicked_cells];
          customclicked_cells.push(cellData);
          setCurrentEntry({
            ...currentEntry,
            clicked_cells: customclicked_cells,
          });
          return;
        }
      }

      if (
        currentEntry.clicked_cells.find(
          (item) =>
            item.colId === cellData.colId && item.rowIndex === cellData.rowIndex
        )
      ) {
        const customclicked_cells = [...currentEntry.clicked_cells].filter(
          (item) =>
            !(
              item.colId === cellData.colId &&
              item.rowIndex === cellData.rowIndex
            )
        );
        setCurrentEntry({
          ...currentEntry,
          clicked_cells: customclicked_cells,
        });
      }
      // }
    }
  };

  const handleChangeEntryName = (e) => {
    setIsDirty(true);
    setCurrentEntry({
      ...currentEntry,
      name: e.target.value,
    });
  };

  useEffect(() => {
    if (currentWeek && currentWeek.value) {
      fetchPickPercentages();
      fetchWinProbability();
    }
  }, [currentWeek]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     fetchWinProbability();
  //   }, 3600000);
  // }, []);

  const fetchPickPercentages = async () => {
    try {
      setLoadingStatus({
        text: 'Calculating pick percentages',
        loading: true,
      });
      const { data } = await API.get(
        `/entry/calculate-pick/${currentWeek.value}`
      );
      setPickData(data);
      setLoadingStatus({
        text: 'Calculated pick percentages',
        loading: false,
      });
    } catch (e) {
      setLoadingStatus({
        text: 'Failed to calculate pick percentages',
        loading: false,
      });
      console.log(e);
    }
  };

  const fetchWinProbability = async () => {
    try {
      setLoadingStatus({
        text: 'Calculating win probability',
        loading: true,
      });
      const { data } = await API.get(`/win-probability/${currentWeek.value}`);
      setWinData(data);
      setLoadingStatus({
        text: 'Calculated win probability',
        loading: false,
      });
    } catch (e) {
      setLoadingStatus({
        text: 'Failed to calculate win probability',
        loading: false,
      });
      console.log(e);
    }
  };

  const handleShowAllSettings = () => {
    setShowAllSettings(!showAllSettings);
  };

  const handleOk = () => {
    setOpenSaveError(false);
  };

  const handleSortChange = (params) => {
    const columnState = params.api.getColumnState().filter((item) => item.sort !== null);
    setSortModel(columnState);
  }

  console.log(currentEntry, filteredData);

  if (window.location.href.includes('survivor-pool-elimination-and-knockout-data')) {
    return <AppWrapper>
      {
        loadingStatus.text !== 'Score data loaded' &&
        <Flex align="center" justify="center" gap="8px">
          <Spin />
          <div>{loadingStatus.text}</div>
        </Flex>
      }
      {
        loadingStatus.text === 'Score data loaded' && !loadingStatus.loading && <>
          <Card>
            <div className="chart-wrapper line">
              {topChartData && <Line data={topChartData} options={topChartOptions} />}
            </div>
            <div className="chart-wrapper bar">
              {bottomChartData && <Bar data={bottomChartData} options={bottomChartOptions} />}
            </div>
          </Card>
          <div className="tables">
            <div className="table-panel">
              <div className="table-header">
                Top Upsets by W%
              </div>
              <div className="table-wrapper">
                <Table columns={table_columns} dataSource={topUpsetsByWin} />
              </div>
            </div>
            <div className="table-panel">
              <div className="table-header">
                Top Upsets by P%
              </div>
              <div className="table-wrapper">
                <Table columns={table_columns} dataSource={topUpsetsByPick} />
              </div>
            </div>
          </div>
        </>
      }
    </AppWrapper>
  }
  return (
    <AppWrapper>
      {contextHolder}
      {customColDefs && customColDefs.length > 2 && (
        <TopWrapper>
          <AppTitle>NFL Survivor Grid - {currentWeek?.label || ""}</AppTitle>
          <Links>
            <a
              href="https://www.rotoballer.com/nfl-survivor-pool-strategy-expert-tips-for-survivor-leagues/1519975"
              target="_blank"
            >
              Survivor Strategy
            </a>
            <a
              href="https://george-dev-rotoballer-prototype.pantheonsite.io/survivor-pool-aggregate-consensus-picks-and-data"
              target="_blank"
            >
              Aggregate Picks
            </a>
            <a
              href="https://george-dev-rotoballer-prototype.pantheonsite.io/survivor-pool-elimination-and-knockout-data"
              target="_blank"
            >
              Elimination Data
            </a>
          </Links>
        </TopWrapper>
      )}
      {customColDefs && customColDefs.length === 2 && (
        <TopWrapper>
          <AppTitle>2025 {currentWeek?.label || ""} Aggregate Picks </AppTitle>
          <Select
            prefix={<img src={Calendar} width="15px" height="16px" alt="" />}
            options={fullWeeks}
            value={currentWeek ? currentWeek.value : undefined}
            onChange={handleChangeWeek}
            style={{ width: "170px", height: "48px" }}
          />
        </TopWrapper>
      )}
      {customColDefs && customColDefs.length > 2 && (
        <Card
          title={
            <EntryButtons>
              <div style={{ marginBottom: "10px" }}>
                <div className="entry-name">Create an Entry</div>
                <Input
                  value={currentEntry.name}
                  onChange={handleChangeEntryName}
                  style={{ width: "170px" }}
                />
              </div>
            </EntryButtons>
          }
          style={{ width: "100%" }}
        >
          <PanelWrapper>
            {
              loggedUser?.logged_in === true && <EntryTitle>
              <div className="entry-title">Saved Entries</div>
              <Select
                options={loadedEntries}
                value={currentEntry.id}
                onChange={handleChangeCurrentEntry}
                style={{ width: "170px" }}
                fieldNames={{
                  label: "name",
                  value: "id",
                }}
              />
            </EntryTitle>
            }
            <EntryButtons>
              <Button
                type="primary"
                onClick={handleSaveEntry}
                disabled={
                  !currentEntry.name || !isDirty
                }
              >
                Save
              </Button>
              <Button
                onClick={handleClearEntry}
              >
                Clear
              </Button>
              {
                loggedUser?.logged_in === true && <Popconfirm
                  title="Delete the entry"
                  description="Are you sure to delete this entry?"
                  onConfirm={handleRemoveEntry}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    disabled={!currentEntry.name}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              }
            </EntryButtons>
          </PanelWrapper>
          <PanelWrapper>
            <div>
              <div className="double-picks-start">Double Picks Start</div>
              <Select
                options={[
                  {
                    label: "Never",
                    value: 0,
                  },
                  ...fullWeeks,
                ]}
                value={currentEntry.doublePicksStart}
                onChange={handleChangeDoublePicks}
                style={{ width: "170px" }}
              />
            </div>
            <div style={{ width: "100%" }}>
              <TeamsUsedTitle>
                <div className="teams-used">Teams Used</div>
                <div>
                  {"( "}
                  <Checkbox
                    checked={currentEntry.hide_on_grid}
                    onChange={handleChangeHideOnGrid}
                  >
                    Hide on grid
                  </Checkbox>
                  {")"}
                </div>
              </TeamsUsedTitle>
              <Select
                options={rowData}
                value={currentEntry.teams_used}
                onChange={handleChangeTeamsUsed}
                fieldNames={{
                  label: "name",
                  value: "name",
                }}
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
              />
            </div>
          </PanelWrapper>
        </Card>
      )}
      {customColDefs && customColDefs.length > 2 && (
        <FilterWrapper>
          <Select
            prefix={<img src={Calendar} width="15px" height="16px" alt="" />}
            options={fullWeeks}
            value={currentWeek ? currentWeek.value : undefined}
            onChange={handleChangeWeek}
            style={{ width: "170px", height: "48px" }}
          />
          <div className="all-button" onClick={() => handleShowAllSettings()}>
            <img src={MenuIcon} alt="" width="20px" height="20px" />
            <div className="all-button-text">All Settings</div>
          </div>
          <FilterButtons>
            <ToolOutline>
              <Switch
                checked={showOptions.away}
                onChange={(checked) => handleToggle(checked, "away")}
              />
              <ToolText>Away Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.divisional}
                onChange={(checked) => handleToggle(checked, "divisional")}
              />
              <ToolText>Divisional Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.thursday}
                onChange={(checked) => handleToggle(checked, "thursday")}
              />
              <ToolText>Thursday Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.monday}
                onChange={(checked) => handleToggle(checked, "monday")}
              />
              <ToolText>Monday Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.spreads}
                onChange={(checked) => handleToggle(checked, "spreads")}
              />
              <ToolText>Spreads</ToolText>
            </ToolOutline>
          </FilterButtons>
        </FilterWrapper>
      )}

      {showAllSettings && (
        <div className="mobile-filter-panel">
          <ToolOutline>
            <Switch
              checked={showOptions.away}
              onChange={(checked) => handleToggle(checked, "away")}
            />
            <ToolText>Away Games</ToolText>
          </ToolOutline>
          <ToolOutline>
            <Switch
              checked={showOptions.divisional}
              onChange={(checked) => handleToggle(checked, "divisional")}
            />
            <ToolText>Divisional Games</ToolText>
          </ToolOutline>
          <ToolOutline>
            <Switch
              checked={showOptions.thursday}
              onChange={(checked) => handleToggle(checked, "thursday")}
            />
            <ToolText>Thursday Games</ToolText>
          </ToolOutline>
          <ToolOutline>
            <Switch
              checked={showOptions.monday}
              onChange={(checked) => handleToggle(checked, "monday")}
            />
            <ToolText>Monday Games</ToolText>
          </ToolOutline>
          <ToolOutline>
            <Switch
              checked={showOptions.spreads}
              onChange={(checked) => handleToggle(checked, "spreads")}
            />
            <ToolText>Spreads</ToolText>
          </ToolOutline>
        </div>
      )}
      <GridWrapper simple={window.location.href.includes(
        "survivor-pool-aggregate-consensus-picks-and-data"
      )}>
        <AgGridReact
          rowData={filteredData}
          columnDefs={customColDefs}
          loading={loadingStatus.loading}
          rowHeight={41}
          headerHeight={41}
          onCellClicked={handleCellClick}
          tooltipShowDelay={0} // ← show immediately
          enableBrowserTooltips={false}
          onSortChanged={handleSortChange}
          defaultColDef={{
            sortable: true,
            sortingOrder: ["asc", "desc"], // disables 3rd state
            suppressMovable: true,
          }}
        />
      </GridWrapper>
      <Modal
        open={openSaveError}
        title="Please login"
        onOk={handleOk}
        onCancel={handleOk}
        footer={(_, { OkBtn }) => (
          <>
            <OkBtn />
          </>
        )}
      >
        <p>Login to Save Your Entry</p>
      </Modal>
    </AppWrapper>
  );
}

export default App;
