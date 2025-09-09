import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { isMobile } from "react-device-detect";
import moment from 'moment-timezone';

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
import DiceIcon from "./assets/dice.png";
import TrashIcon from "./assets/trash.png";
import {
  AppTitle,
  AppWrapper,
  EntryButtons,
  FilterButtons,
  FilterWrapper,
  GridWrapper,
  Links,
  TeamsUsedTitle,
  ToolOutline,
  ToolText,
  TopWrapper,
  PanelTop,
  PanelBottom
} from "./styles";
import { bottomChartOptions, table_columns, topChartOptions } from "./constants";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const gridApiRef = useRef();
  const [topChartData, setTopChartData] = useState();
  const [disableSaving, setDisableSaving] = useState(false);
  const [bottomChartData, setBottomChartData] = useState();
  const [topUpsetsByWin, setTopUpsetsByWin] = useState([]);
  const [topUpsetsByPick, setTopUpsetsByPick] = useState([]);
  const [sortedByPointData, setSortedByPointData] = useState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openSaveError, setOpenSaveError] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [showAllSettings, setShowAllSettings] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [loadedEntries, setLoadedEntries] = useState([]);
  const [totalEntries, setTotalEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    id: "",
    name: "",
    doublePicksStart: undefined,
    clicked_cells: [],
    teams_used: [],
    hide_on_grid: false,
    week: 1,
  });
  const [stats, setStats] = useState([]);
  const [intervalId, setIntervaId] = useState();
  const [intervalStarted, setIntervalStarted] = useState(false);
  const [pickData, setPickData] = useState(null);
  const [winData, setWinData] = useState(null);
  const [fvData, setFVData] = useState(null);
  const [sortModel, setSortModel] = useState();
  const [loggedUser, setLoggedUser] = useState(
    {
      logged_in: true,
      user: {
        id: 2991,
        name: "George Coder",
        email: "GeorgeMCoder57@gmail.com"
      }
    }
  );
  const [currentWeek, setCurrentWeek] = useState();
  const [liveWeek, setLiveWeek] = useState(1);
  const [lockPick, setLockPick] = useState(false);
  const [fullWeeks, setFullWeeks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState({
    text: 'Loading...',
    loading: false,
  });
  const [moneyLine, setMoneyLine] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showOptions, setShowOptions] = useState({
    away: true,
    divisional: true,
    thursday: true,
    monday: true,
    lineType: 'moneyLine',
  });
  const [gameResults, setGameResults] = useState([]);

  useEffect(() => {
    fetchLoginInfo();
    fetchTeamMemberList();
    fetchMoneyLine();
    fetchStats();
    fetchFV();
    fetchTotalEntries();
    // fetchFullWeekSchedule();
  }, []);

  useEffect(() => {
    if (rowData.length > 0 && gridApiRef.current && !intervalStarted) {
      const interval = setInterval(() => {
        setCurrentDate(new Date());
      }, 1000 * 60 * 60);  // update current date every hour
      setIntervalStarted(true);
      setIntervaId(interval);
    }
  }, [rowData, gridApiRef, intervalStarted])

  useEffect(() => {
    if (!window.location.href.includes('nfl-survivor-grid-football-survivor-pool-picks-tool')) {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
    if (window.location.href.includes('survivor-pool-elimination-and-knockout-data')) {
      fetchTotalEntries();
    }
  }, [window.location.href]);

  useEffect(() => {
    const targetWeek = calculateCurrentWeek();

    if (targetWeek > 0) {
      if (targetWeek === 18) {
        clearInterval(intervalId);
      }
      setLiveWeek(Number(targetWeek));
      setCurrentWeek({
        label: `Week ${targetWeek}`,
        value: Number(targetWeek),
      })
    } else {
      const savedCurrentWeek = JSON.parse(localStorage.getItem('currentWeek'));
      if (savedCurrentWeek) {
        setLiveWeek(savedCurrentWeek.value);
        setCurrentWeek(savedCurrentWeek)
      } else {
        setLiveWeek(1);
        setCurrentWeek({
          label: `Week 1`,
          value: 1
        });
      }
    }
  }, [currentDate]);


  useEffect(() => {
    if (loggedUser?.logged_in === true) {
      handleLoadEntry();
      loadLocalStorageData();
    }
    if (loggedUser?.logged_in === false) {
      loadLocalStorageData();
    }
  }, [loggedUser]);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchFullWeekSchedule();
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
  }, [scoreData, sortedByPointData]);

  const fetchMoneyLine = async () => {
    const { data } = await API.get(`/money-line/`);
    setMoneyLine(data);
  }

  const isHide = () => {
    if (totalEntries.length > 0) {
      const targetEntries = totalEntries.filter((item) => {
        const targetClickedCells = item.clicked_cells.filter((clickedItem) => clickedItem.week === currentWeek.value);
        if (targetClickedCells.length > 0) {
          return true;
        }
        return false;
      });
      if (!targetEntries || targetEntries && targetEntries.length <= 49) return true;
      
      return false;
    }

    return false;
  }

  const adjustGridHeight = () => {
    const gridWrapper = document.querySelector('.grid-wrapper');
    if (gridWrapper) {
      const pinnedWrapper = document.querySelector('.ag-pinned-left-cols-container');
      if (pinnedWrapper) {
        const newHeight = document.querySelector('.ag-pinned-left-cols-container').clientHeight;
        gridWrapper.style.height = `${newHeight + 34}px`;
      }
    }
  }

  const fetchStats = async () => {
    const { data } = await API.get(`/stats/`);
    setStats(data);
  }
  const fetchLoginInfo = () => {
    return;
    fetch(WP_API.root + "custom/v1/user-status", {
      method: "GET",
      credentials: "include", // This is crucial for sending cookies
      headers: {
        "X-WP-Nonce": WP_API.nonce,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("loading user", data);
        if (!loggedUser) {
          setLoggedUser(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching login info:", error);
      });
  };

  const loadLocalStorageData = () => {
    if (!loggedUser || loggedUser.logged_in === false) {
      // const savedCurrentWeek = JSON.parse(localStorage.getItem('currentWeek'));
      // if (savedCurrentWeek) {
      //   setCurrentWeek(savedCurrentWeek);
      // }
      const savedShowOptions = JSON.parse(localStorage.getItem('showOptions'));
      if (savedShowOptions) {
        setShowOptions(savedShowOptions);
      }
      const savedClickedCells = JSON.parse(localStorage.getItem('clicked_cells'));
      if (savedClickedCells && savedClickedCells.length > 0) {
        setCurrentEntry({
          ...currentEntry,
          clicked_cells: savedClickedCells
        })
      }
    } else {
      // const savedCurrentWeek = JSON.parse(localStorage.getItem('currentWeek'));
      // if (savedCurrentWeek) {
      //   setCurrentWeek(savedCurrentWeek);
      // }
      const savedShowOptions = JSON.parse(localStorage.getItem('showOptions'));
      if (savedShowOptions) {
        setShowOptions(savedShowOptions);
      }
    }
  }

  const calculateGameResults = () => {
    if (filteredData.length > 0) {
      const gamesOfCurrentWeek = filteredData.flatMap((team) => {
        return {
          name: team.name,
          [`week${currentWeek.value}`]: team[`week${currentWeek.value}`]
        }
      });

      const results = [];
      gamesOfCurrentWeek.forEach((game) => {
        const gameInfo = game[`week${currentWeek.value}`];
        const targetScore = scoreData.find((item) => item.GameKey === gameInfo.game_key && item.ScoreID === gameInfo.score_id);
        if (!targetScore) return;

        const isHome = targetScore.HomeTeam === game.name;
        const home_score = targetScore.HomeScore;
        const away_score = targetScore.AwayScore;

        if (home_score && away_score) {
          const isLost = isHome
            ? home_score < away_score
            : away_score < home_score;

          results.push({
            ...game,
            isLost
          });
        }
      });
      setGameResults(results);
    }
  }

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
  }

  const filteredData = useMemo(() => {
    let customData = [...rowData];

    // if (winData && winData.results.length > 0) {
    //   customData = customData.map((item) => {
    //     const targetWinItem = winData.results.find(
    //       (winItem) => winItem.abbreviation === item.name
    //     );

    //     if (targetWinItem) {
    //       return {
    //         ...item,
    //         win_probability: targetWinItem.winProbability || 0,
    //       };
    //     }

    //     return item;
    //   }).sort((a, b) => b.win_probability - a.win_probability);
    // }

    if (currentEntry.hide_on_grid) {
      customData = customData.filter(
        (item) => !currentEntry.teams_used.includes(item.name)
      );
    }

    if (sortModel?.length > 0) {
      const { colId, sort } = sortModel[0];
      customData.sort((a, b) => {
        const getValue = (item) => {
          if (colId.includes('week')) {
            if (showOptions.lineType === 'moneyLine') {
              return item[colId]?.moneyLine ? parseFloat(item[colId].moneyLine) : null;
            } else {
              return item[colId]?.point ? parseFloat(item[colId].point) : null;
            }
          }

          if (colId === "win_probability") {
            if (winData && winData.results.length > 0) {
              const targetWinItem = winData.results.find(
                (winItem) => winItem.abbreviation === item.name
              );
              if (targetWinItem) return targetWinItem.winProbability;
              return null;
            }
            return null;
          }

          if (colId === "p_percent") {
            if (pickData && pickData.results.length > 0) {
              const targetPickItem = pickData.results.find(
                (winItem) => winItem.abbreviation === item.name
              );
              if (targetPickItem) return targetPickItem.percentage;
              return null;
            }
            return null;
          }

          if (colId === "fv") {
            if (fvData && fvData.length > 0) {
              const targetFVItem = fvData.find(
                (fvItem) => fvItem.abbreviation === item.name
              );
              if (targetFVItem) return Number(targetFVItem.fv);
              return null;
            }
            return null;
          }
          return item[colId] ?? null;
        };

        const valA = getValue(a);
        const valB = getValue(b);

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1; // a goes after b
        if (valB == null) return -1; // b goes after a

        // Compare normally
        if (valA < valB) return sort === 'asc' ? -1 : 1;
        if (valA > valB) return sort === 'asc' ? 1 : -1;
      });
    }

    if (currentEntry.hide_on_grid || currentEntry?.teams_used.length > 0) {
      setTimeout(() => {
        adjustGridHeight();
      }, 500);
    }

    if (moneyLine.length > 0) {
      customData.forEach((item) => {
        Array.from({ length: 18 }, (_, i) => i + 1)
          .map((weekNum) => {
            const weekHeader = `week${weekNum}`;
            if (item[weekHeader].isAway) {
              const targetMoneyLineObj = moneyLine.find((moneyLineItem) => moneyLineItem.AwayTeamName === item.name.replace('@', '') && moneyLineItem.HomeTeamName === item[weekHeader].name.replace('@', ''));
              if (targetMoneyLineObj) {
                item[weekHeader].moneyLine = targetMoneyLineObj.PregameOdds[0].AwayMoneyLine;
              }
            } else {
              const targetMoneyLineObj = moneyLine.find((moneyLineItem) => moneyLineItem.HomeTeamName === item.name.replace('@', '') && moneyLineItem.AwayTeamName === item[weekHeader].name.replace('@', ''));
              if (targetMoneyLineObj) {
                item[weekHeader].moneyLine = targetMoneyLineObj.PregameOdds[0].HomeMoneyLine;
              }
            }
          });
      })
    }

    setLoadingStatus({
      text: 'Preparint Data',
      loading: false,
    });
    return customData;
  }, [
    currentEntry.hide_on_grid,
    rowData,
    currentEntry.teams_used,
    pickData,
    winData,
    sortModel,
    moneyLine,
    stats
  ]);

  useEffect(() => {
    if (scoreData && scoreData.length > 0 && currentWeek && currentWeek.value > 0 && filteredData.length > 0) {
      calculateGameResults();
    }
  }, [scoreData, currentWeek, filteredData]);

  useEffect(() => {
    if (currentEntry.clicked_cells.length > 0) {
      reCalculateClickedCells();
    }

    adjustGridHeight();
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
      handleTableData();
    }
  }, [scoreData]);

  useEffect(() => {
    if (totalEntries.length > 0 && scoreData?.length > 0) {
      const skyWrapper1 = document.querySelector('#second-skyscraper');
      if (skyWrapper1) {
        skyWrapper1.style.display = 'none';
      }
      const skyWrapper2 = document.querySelector('#second-skyscraper-R');
      if (skyWrapper2) {
        skyWrapper2.style.display = 'none';
      }

      // const mainWrapper = document.querySelector('#main-container');
      // if (mainWrapper) {
      //   mainWrapper.style.display = 'flex';
      // }
      // const rightContainer = document.querySelector('#right-container');
      // if (rightContainer) {
      //   rightContainer.style.display = 'flex';
      // }
      // const footerContainer = document.querySelector('#footer-container');
      // if (footerContainer) {
      //   footerContainer.style.display = 'flex';
      //   footerContainer.style.flexDirection = 'column';
      // }

      handleKnockoutStats();
    }
  }, [totalEntries, scoreData]);

  const handleTableData = () => {
    if (filteredData && filteredData.length > 0 && 'p_percent' in filteredData[0] && 'win_probability' in filteredData[0]) {
      const sortedGames = filteredData.flatMap(teamObj => {
        return Object.entries(teamObj)
          .filter(([key, value]) => /^week\d+$/.test(key) && value && value.name !== 'BYE')
          .map(([week, game]) => {
            return ({
              ...game,
              week: Number(week.replace(/\D/g, '')),
              team1: teamObj.name,
              team2: game.name,
              win_probability: teamObj.win_probability,
              p_percent: filteredData.find((item) => item.name === game.name.replace('@', ''))?.p_percent,
              point: Number(game.point)
            })
          });
      })
        .sort((a, b) => b.point - a.point);
      setSortedByPointData(sortedGames);
    }
  }

  const handleKnockoutStats = () => {
    const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
    const lossPercentages = [];
    const lossPercentagesByWeek = [];
    const totalPicks = totalEntries.flatMap((entry) => entry.clicked_cells);
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

  const getBackgroundColor = (cellData) => {
    if (showOptions.lineType === 'spreads') {
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
    } else {
      const point = cellData.moneyLine;
      if (point > -175) {
        return "#fdfffd";
      } else if (point > -400 && point <= -175) {
        // Gradient range: map point from [-10, -3] to [0, 1]
        const t = (-175 - point) / 225; // 0 at -3, 1 at -10

        // Interpolate between #fdfffd and #4cff4c
        const startColor = [253, 255, 253]; // RGB of #fdfffd
        const endColor = [76, 255, 76]; // RGB of #4cff4c

        const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
        const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
        const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);

        const backgroundColor = `rgb(${r}, ${g}, ${b})`;
        return backgroundColor;
      } else if (point <= -400) {
        return "#4cff4c";
      }
    }
  };
  const getClassName = (cellData) => {
    const cellDate = new Date(cellData.dateTime);
    let className = "show-spreads";

    // getDay() returns 1 for Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const isMonday = cellDate.getDay() === 1;
    const isThursday = cellDate.getDay() === 4;

    // if (!showOptions.spreads) {
    //   className = "hide-spreads";
    // }

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

    if (
      currentEntry.doublePicksStart > 0 &&
      parseInt(params.colDef.field.replace(/\D/g, ""), 10) >=
        currentEntry.doublePicksStart
    ) {
      const hasDoubledItems = currentEntry.clicked_cells.filter((item) => item.week >= currentEntry.doublePicksStart && item.colId === params.colDef.field);
      if (hasDoubledItems.length < 2 &&
        currentEntry.clicked_cells.find(
          (item) =>
            item.colId === params.colDef.field &&
            params.rowIndex !== item.rowindex && !currentEntry.clicked_cells.find((item) => item.rowIndex === params.rowIndex)
        )
      ) {
        return "fake-disabled";
      }
    }

    return "";
  };

  const customCellRenderer = (props, customClass) => {
    // const { node, colDef } = props;
    // const isSameRow = currentEntry.clicked_cells.find(
    //   (item) => item.rowIndex === node.rowIndex
    // );
    // const isCurrentCell = currentEntry.clicked_cells.find(
    //   (item) =>
    //     node.rowIndex === item.rowIndex && colDef.field === item.colId
    // );
    let cellValue = null;
    if (customClass === 'win-percent' && winData && winData.results.length > 0) {
      const targetWinItem = winData.results.find(
        (winItem) => winItem.abbreviation === props.data.name
      );
      if (targetWinItem) {
        cellValue = targetWinItem.winProbability;
      }
    }
    if (customClass === 'pick-percent' && pickData && pickData.results.length > 0) {
      const targetPickItem = pickData.results.find(
        (pickItem) => pickItem.team === props.data.name
      );
      if (targetPickItem) {
        cellValue = targetPickItem.percentage;
      }
    }

    if (customClass === 'fv-value' && fvData.length > 0) {
      const targetFVItem = fvData.find(
        (fvItem) => fvItem.abbreviation === props.data.name
      );
      if (targetFVItem) {
        cellValue = Number(targetFVItem.fv);
      }
    }

    let targetStatObj = null;
    if (stats.length > 0) {
      const targetStat = stats.find((stat) => stat.Team === props.data.name);
      if (targetStat) {
        targetStatObj = {
          wl: `${targetStat.Wins}-${targetStat.Losses}`,
          streak: targetStat.Streak < 0 ? '1L' : `${targetStat.Streak}W`,
          pfpa: `${targetStat.PointsFor} / ${targetStat.PointsAgainst}`
        }
      }
    }

    return (
      <div className={customClass}>
        {/* {currentEntry.teams_used.includes(props.data.name) && (
          <div className="red-bar-horizontal" />
        )}
        {!isCurrentCell && isSameRow && (
          <div className="red-bar-horizontal" />
        )} */}
        {customClass === 'win-percent' && (
          cellValue > 0 ? `${cellValue}%` : '-'
        )}
        {customClass === 'pick-percent' && (
          cellValue > 0 ? `${cellValue}%` : '-'
        )}
        {customClass === 'fv-value' && (
          cellValue
        )}
        {customClass === 'stats-values' && targetStatObj && (
          <>
            <div className="stats-values-top">
              <div className="wl">
                {targetStatObj.wl}
              </div>
              <div className="streak">
                {targetStatObj.streak}
              </div>
            </div>
            <div className="stats-values-bottom">
              {targetStatObj.pfpa}
            </div>
          </>
        )}
      </div>
    );
  }

  const customColDefs = useMemo(() => {
    if (!currentWeek) {
      return;
    }
    const weekCols = Array.from({ length: 18 }, (_, i) => i + 1)
      .filter((weekNum) => weekNum >= currentWeek.value)
      .map((weekNum) => ({
        headerName: `${weekNum}`,
        headerClass: (params) => {
          const isSameCol = currentEntry.clicked_cells.find((item) => item.colId === params.colDef.field);
          if (isSameCol) {
            return 'selected-column';
          }
          return '';
        },
        field: `week${weekNum}`,
        cellClass: (params) => getCellClass(params),
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
          // "cell-disabled-fake": (params) => isDisabledFake(params),
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
          const cellClassName = getClassName(props.data[`week${weekNum}`]);
          return (
            <div
              className={cellClassName}
              style={{
                backgroundColor: cellClassName.includes('gray') ? 'white' : getBackgroundColor(
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
              {
                showOptions.lineType === 'spreads' ? <div className="point-value">
                  {`${props.data[`week${weekNum}`].point
                    ? props.data[`week${weekNum}`].point > 0
                      ? `+${props.data[`week${weekNum}`].point}`
                      : props.data[`week${weekNum}`].point
                    : ""
                    }`}
                </div> : <div className="point-value">
                  {`${props.data[`week${weekNum}`].moneyLine
                    ? props.data[`week${weekNum}`].moneyLine > 0
                      ? `+${props.data[`week${weekNum}`].moneyLine}`
                      : props.data[`week${weekNum}`].moneyLine
                    : ""
                    }`}
                </div>
              }
            </div>
          );
        },
        width: 60,
        minWidth: isMobile ? 60 : 60,
        flex: 1,
        maxWidth: isMobile ? 60 : 1000
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
                className={`team-name ${currentEntry.teams_used.includes(props.value)
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
            "Percentage that each team is picked in a given week, based on all RotoBaller Survivor Tool users. Resets each week once a critical mass of picks have been made.",
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
        sortable: true,
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
          let targetResult = null;

          if (gameResults.length > 0) {
            targetResult = gameResults.find((gameResult) => gameResult.name === props.value);
          }

          return (
            <div
              className={`team-name ${currentEntry.teams_used.includes(props.value) || (!isCurrentCell && isSameRow)
                ? "cell-selected"
                : ""
                }`}
            >
              {currentEntry.teams_used.includes(props.value) && (
                <div className="red-bar-underline" />
              )}
              {!isCurrentCell && isSameRow && (
                <div className="red-bar-underline" />
              )}
              {props.value} {targetResult && <span className={targetResult.isLost ? 'lost' : 'win'}>{`(${targetResult.isLost ? 'L' : 'W'})`}</span>}
            </div>
          );
        },
        pinned: "left",
        width: 55,
        minWidth: isMobile ? 45 : 56,
      },
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
        cellRenderer: (props) => customCellRenderer(props, 'win-percent'),
        width: 50,
        flex: 1,
        pinned: "left",
        minWidth: isMobile ? 45 : 56,
      },
      {
        field: "p_percent",
        headerName: "P%",
        headerTooltip:
          "Percentage that each team is picked in a given week, based on all RotoBaller Survivor Tool users. Resets each week once a critical mass of picks have been made.",
        sortable: true,
        hide: isHide(),
        comparator: (valueA, valueB) => {
          return valueA - valueB;
        },
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
        },
        cellRenderer: (props) => customCellRenderer(props, 'pick-percent'),
        width: 50,
        // flex: 1,
        minWidth: isMobile ? 45 : 56,
      },
      {
        field: "fv",
        headerName: "FV",
        width: 56,
        headerTooltip: "Aggregate future value of a team, on a 0-100 scale. Utilizes RotoBaller Win Probability to simply show which team's have the most value beyond the current week",
        cellRenderer: (props) => customCellRenderer(props, 'fv-value'),
      },
      {
        field: 'stats',
        headerName: "Stats",
        sortable: false,
        width: 60,
        minWidth: isMobile ? 60 : 60,
        headerTooltip: 'W/L record, streak, and points for/against',
        cellRenderer: (props) => customCellRenderer(props, 'stats-values'),

        hide: currentWeek.value < 2,
      },
      ...weekCols,
    ];
  }, [showOptions, currentWeek, currentEntry, isMobile, window.location.href, loadedEntries, gameResults, pickData, winData, fvData, stats]);

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
      // setCurrentWeek(customWeeks[0]);

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
      fetchLoginInfo();
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Failed to load full week schedule',
        loading: false,
      });
    }
  };

  const handleChangeWeek = (value, option) => {
    // if (value < liveWeek) {
    //   setLockPick(true);
    // } else {
    //   setLockPick(false);
    // }
    setIsDirty(true);
    localStorage.setItem('currentWeek', JSON.stringify(option));
    setCurrentWeek(option);
  };

  const handleToggle = (checked, type) => {
    setShowOptions({
      ...showOptions,
      [type]: checked,
    });

    localStorage.setItem('showOptions', JSON.stringify({
      ...showOptions,
      [type]: checked,
    }));
  };

  const handleSaveEntry = async () => {
    if (!loggedUser || loggedUser?.logged_in === false) {
      setOpenSaveError(true);
      return;
    } else {
      setDisableSaving(true);
      try {
        const payload = {
          ...currentEntry,
          week: liveWeek,
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
            api.success({
              message: "Entry Created",
              description: "Your new entry has been saved successfully.",
              placement: "bottomRight",
            });
            handleLoadEntry(data.insert_id);
          }
        } else {
          const { data } = await API.put(`/entry/${currentEntry.id}`, payload);
          if (data.success) {
            api.success({
              message: "Entry Updated",
              description: "Your current entry has been updated successfully.",
              placement: "bottomRight",
            });
            handleLoadEntry();
          }
        }
        setDisableSaving(false);
      } catch (e) {
        console.log(e);
        api.error({
          message: "Failed!",
          description: e.response.data.error,
          placement: "bottomRight",
        });
        setDisableSaving(false);
      }
    }
  };

  const onGridReady = useCallback(({ api }) => {
    gridApiRef.current = api;
    fetchLoginInfo();
  }, []);

  const fetchTotalEntries = async () => {
    try {
      const { data } = await API.get('/entry/all');
      setTotalEntries(data);
    } catch (e) {
      console.log(e);
    }
  }

  const handleLoadEntry = async (newEntryId) => {
    if (loggedUser) {
      setLoadingStatus({
        text: 'Loading saved entries',
        loading: true,
      });
      // Store the current entry ID before clearing
      const currentEntryId = currentEntry.id;

      setLoadedEntries([]);
      setCurrentEntry({
        id: "",
        name: "",
        doublePicksStart: undefined,
        clicked_cells: [],
        teams_used: [],
        hide_on_grid: false,
        week: 1,
      });
      try {
        const { data } = await API.get(`/entry/${loggedUser.user.id}`);
        setLoadedEntries(data);

        if (Array.isArray(data) && data.length > 0) {
          // Try to find the previously selected entry
          let previouslySelectedEntry = data.find(entry => entry.id === currentEntryId);

          if (newEntryId) {
            previouslySelectedEntry = data.find(entry => entry.id === newEntryId);
          }
          const savedCurrentEntry = JSON.parse(localStorage.getItem('currentEntry'));
          let targetEntry = null;
          if (savedCurrentEntry) {
            targetEntry = data.find(entry => entry.id === savedCurrentEntry.id);
          }
          // If the previously selected entry exists, use it; otherwise use the first entry
          const entryToSelect = previouslySelectedEntry || targetEntry || data[0];
          handleChangeCurrentEntry(null, entryToSelect);
          setLoadingStatus({
            text: 'Loaded saved entries',
            loading: false,
          });
        } else {
          const savedClickedCells = JSON.parse(localStorage.getItem('clicked_cells'));
          if (savedClickedCells && savedClickedCells.length > 0) {
            setCurrentEntry({
              ...currentEntry,
              clicked_cells: savedClickedCells
            })
          }
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
      doublePicksStart: undefined,
      clicked_cells: [],
      teams_used: [],
      hide_on_grid: false,
      week: 1,
      id: null,
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
    localStorage.setItem('currentEntry', JSON.stringify(option));
  };

  const handleChangeTeamsUsed = (value, option) => {
    setCurrentEntry({
      ...currentEntry,
      teams_used: value,
    });
    setIsDirty(true);
  };

  const handleChangeHideOnGrid = (checked) => {
    setCurrentEntry({
      ...currentEntry,
      hide_on_grid: checked,
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
        return true;
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

    if (currentEntry.doublePicksStart === 0 || currentEntry.doublePicksStart === undefined) {
      let customclicked_cells = [];
      if (
        !currentEntry.clicked_cells.find(
          (item) => item.colId === cellData.colId
        )
      ) {
        customclicked_cells = [...currentEntry.clicked_cells];
        customclicked_cells.push(cellData);
        setCurrentEntry({
          ...currentEntry,
          clicked_cells: customclicked_cells,
        });
      } else {
        customclicked_cells = [...currentEntry.clicked_cells].filter(
          (item) => item.colId !== event.colDef.field
        );
        setCurrentEntry({
          ...currentEntry,
          clicked_cells: customclicked_cells,
        });
      }

      localStorage.setItem('clicked_cells', JSON.stringify(customclicked_cells));
      return;
    }
    if (currentEntry.doublePicksStart > 0) {
      let customclicked_cells = [];
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
          customclicked_cells = [...currentEntry.clicked_cells];
          customclicked_cells.push(cellData);
          setCurrentEntry({
            ...currentEntry,
            clicked_cells: customclicked_cells,
          });
          localStorage.setItem('clicked_cells', JSON.stringify(customclicked_cells));
          return;
        }
      }

      if (
        currentEntry.clicked_cells.find(
          (item) =>
            item.colId === cellData.colId && item.rowIndex === cellData.rowIndex
        )
      ) {
        customclicked_cells = [...currentEntry.clicked_cells].filter(
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
        localStorage.setItem('clicked_cells', JSON.stringify(customclicked_cells));
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
    if (currentWeek && currentWeek.value && !lockPick) {
      if (!lockPick) {
        fetchPickPercentages();
      }

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
        text: 'Loading',
        loading: true
      })
      const { data } = await API.get(
        `/entry/calculate-pick/${currentWeek.value}`
      );
      if (data && Array.isArray(data.results)) {
        setPickData(data);
      }
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Loading',
        loading: false
      })
    }
  };

  const fetchWinProbability = async () => {
    try {
      setWinData(null);
      const { data } = await API.get(`/win-probability/${currentWeek.value}`);
      setWinData(data);
      setLoadingStatus({
        text: 'Loading',
        loading: false
      })
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Loading',
        loading: false
      })
    }
  };

  const fetchFV = async () => {
    try {
      setFVData([]);
      const { data } = await API.get(`/fv-data`);
      setFVData(data);
      setLoadingStatus({
        text: 'Loading',
        loading: false
      })
    } catch (e) {
      console.log(e);
      setLoadingStatus({
        text: 'Loading',
        loading: false
      })
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

  const calculateCurrentWeek = () => {
    // const etTime = moment(currentDate).tz("America/New_York");
    // const etTime = moment(currentDate);
    const etTime = moment();
    const isTuesday1AM = etTime.day() === 2 &&
      etTime.hour() === 1;

    if (isTuesday1AM) {
      if (gridApiRef.current) {
        let customState = gridApiRef.current.getColumnState();
        customState[1].sort = 'desc';

        gridApiRef.current.applyColumnState({
          state: customState,
          applyOrder: true
        });
      }

      for (let week = 1; week <= 18; week++) {
        const weekKey = `week${week}`;
        const weekDates = filteredData
          .map(item => item[weekKey]?.dateTime)
          .filter(Boolean)
          .map(dateStr => moment(dateStr));

        if (weekDates.length === 0) continue;

        const start = moment.min(weekDates);
        const end = moment.max(weekDates);
        const sameWeekAsStart = etTime.isSame(start, 'week');
        const sameWeekAsEnd = etTime.isSame(end, 'week');
        const isInRange = etTime.isBetween(start, end, null, '[]'); // inclusive

        if (isInRange || sameWeekAsStart || sameWeekAsEnd) {
          return weekKey.replace('week', ''); // Found current week
        }
      }
    }

    return null; // No week matched
  }

  const handleChangeLineType = (value) => {
    setShowOptions({
      ...showOptions,
      lineType: value,
    });
    localStorage.setItem('showOptions', JSON.stringify({
      ...showOptions,
      lineType: value,
    }));
  }

  if (window.location.href.includes('survivor-pool-elimination-and-knockout-data')) {

    return (
      <AppWrapper>
        {
          loadingStatus.loading &&
          <Flex align="center" justify="center" gap="8px">
            <Spin />
            <div>{loadingStatus.text}</div>
          </Flex>
        }
        {
          topChartData && bottomChartData &&
          <Card style={{ marginBottom: '20px' }}>
            <div className="chart-wrapper line">
              {topChartData && <Line data={topChartData} options={topChartOptions} />}
            </div>
            <div className="chart-wrapper bar">
              {bottomChartData && <Bar data={bottomChartData} options={bottomChartOptions} />}
            </div>
          </Card>
        }
        {
          topUpsetsByPick.length > 0 && topUpsetsByWin.length > 0 && <div className="tables">
            <div className="table-panel">
              <div className="table-header">
                Top Upsets by W%
              </div>
              <div className="upset-table-wrapper">
                <Table columns={table_columns} dataSource={topUpsetsByWin} pagination={false} />
              </div>
            </div>
            <div className="table-panel">
              <div className="table-header">
                Top Upsets by P%
              </div>
              <div className="upset-table-wrapper">
                <Table columns={table_columns} dataSource={topUpsetsByPick} pagination={false} />
              </div>
            </div>
          </div>
        }
      </AppWrapper>
    )
  }
  return (
    <AppWrapper>
      {contextHolder}
      {customColDefs && customColDefs.length > 2 && (
        <TopWrapper>
          <AppTitle>NFL Survivor Grid - {currentWeek?.label || ""}</AppTitle>
          {/* <Links>
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
          </Links> */}
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
        <Card className="entry-card">
          <PanelTop>
            <div className="panel-top-left">
              <div className="entry-wrapper">
                <div className="entry-name">Create an Entry</div>
                <Input
                  value={currentEntry.name}
                  onChange={handleChangeEntryName}
                  style={{ width: "100%", height: '43px' }}
                  placeholder="Create an Entry"
                />
              </div>
              <EntryButtons>
                <Button
                  type="primary"
                  onClick={handleSaveEntry}
                  disabled={
                    !currentEntry.name || !isDirty || disableSaving || currentEntry.clicked_cells.length < 1
                  }
                  shape="round"
                  className="save-btn"
                >
                  Save
                </Button>
                <Button
                  onClick={handleClearEntry}
                  shape="round"
                  className="clear-btn"
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
                      className="remove-btn"
                      disabled={!currentEntry.name}
                      shape="circle"
                      style={{ background: '#E0E0E0', height: '40px', width: '40px' }}
                      icon={<img src={TrashIcon} width="14px" height="16px" alt="" />}
                    >
                    </Button>
                  </Popconfirm>
                }
              </EntryButtons>
            </div>
            {
              loggedUser?.logged_in === true && <div className="panel-top-right">
                <div className="entry-name">Saved Entries</div>
                <Select
                  options={loadedEntries}
                  value={currentEntry.id}
                  onChange={handleChangeCurrentEntry}
                  style={{ width: "331px", height: '43px' }}
                  fieldNames={{
                    label: "name",
                    value: "id",
                  }}
                  placeholder="Saved Entries"
                />
              </div>
            }
          </PanelTop>
          <PanelBottom>
            <div className="teams-used">
              <TeamsUsedTitle>
                <div className="teams-used-title">Previous Teams Used</div>
                <div className="show-switch">
                  <Switch
                    checked={currentEntry.hide_on_grid}
                    onChange={(checked) => handleChangeHideOnGrid(checked)}
                    size="small"
                  />
                  <div className="show-title">
                    Hide
                  </div>
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
                placeholder="Previous Teams Used"
                // allowClear
                style={{ width: "100%", minHeight: '43px', height: 'fit-content' }}
              />
            </div>
            <div className="double-picks-start-panel">
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
                placeholder="Double Picks Start"
                onChange={handleChangeDoublePicks}
                style={{ width: "331px", minHeight: '43px', height: '43px' }}
              />
            </div>

          </PanelBottom>
        </Card>
      )}
      {customColDefs && customColDefs.length > 2 && (
        <FilterWrapper>
          <Select
            prefix={<img src={Calendar} width="15px" height="16px" alt="" />}
            options={fullWeeks}
            className="week-select"
            value={currentWeek ? currentWeek.value : undefined}
            onChange={handleChangeWeek}
            style={{ width: "170px", height: "44px" }}
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
                size="small"
              />
              <ToolText>Away Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.divisional}
                onChange={(checked) => handleToggle(checked, "divisional")}
                size="small"
              />
              <ToolText>Divisional Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.thursday}
                onChange={(checked) => handleToggle(checked, "thursday")}
                size="small"
              />
              <ToolText>Thursday Games</ToolText>
            </ToolOutline>
            <ToolOutline>
              <Switch
                checked={showOptions.monday}
                onChange={(checked) => handleToggle(checked, "monday")}
                size="small"
              />
              <ToolText>Monday Games</ToolText>
            </ToolOutline>
            <Select
              prefix={<img src={DiceIcon} width="20px" height="20px" alt="" />}
              options={[{
                label: 'Spreads',
                value: 'spreads'
              }, {
                label: 'Money Line',
                value: 'moneyLine'
              }]}
              value={showOptions.lineType}
              onChange={handleChangeLineType}
              className="line-select"
              style={{ width: "170px", height: "42px" }}
            />
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
          <Select
            prefix={<img src={DiceIcon} width="20px" height="20px" alt="" />}
            options={[{
              label: 'Spreads',
              value: 'spreads'
            }, {
              label: 'Money Line',
              value: 'moneyLine'
            }]}
            value={showOptions.lineType}
            onChange={handleChangeLineType}
            className="line-select"
            style={{ width: "100%", height: "42px" }}
          />
        </div>
      )}
      <GridWrapper className="grid-wrapper" simple={window.location.href.includes(
        "survivor-pool-aggregate-consensus-picks-and-data"
      )}>
        {loadingStatus.loading === true ?
          <div className="loading-wrapper">
            <Spin tip="Loading" size="large">
            </Spin>
          </div> :
          <AgGridReact
            rowData={filteredData}
            columnDefs={customColDefs}
            rowHeight={31}
            headerHeight={31}
            onGridReady={onGridReady}
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
        }
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
