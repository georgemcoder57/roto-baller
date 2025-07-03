import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component

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
} from "antd";
import Calendar from "./assets/calendar.png";
import {
  AppTitle,
  AppWrapper,
  EntryButtons,
  FilterWrapper,
  GridWrapper,
  Links,
  PanelWrapper,
  TeamsUsedTitle,
  ToolOutline,
  ToolText,
  TopWrapper,
} from "./styles";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const [entryloaded, setEntryLoaded] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();
  const [api, contextHolder] = notification.useNotification();
  const [clickedCell, setClickedCell] = useState(null);
  const [secondClickedCell, setSecondClickedCell] = useState(null);
  const [loadedEntries, setLoadedEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    id: "",
    name: "",
    doublePicksStart: 0,
    team1: "",
    team2: null,
    teams_used: [],
    hide_on_grid: false,
    week: 1,
  });
  const [loggedUser, setLoggedUser] = useState({
    logged_in: true,
    user: {
      id: 132865,
      name: "George Coder",
      email: "GeorgeMCoder57@gmail.com",
    },
  });
  const [currentWeek, setCurrentWeek] = useState({
    label: "Week 1",
    value: 1,
  });
  const [fullWeeks, setFullWeeks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showOptions, setShowOptions] = useState({
    away: true,
    divisional: true,
    thursday: true,
    monday: true,
    spreads: true,
  });

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    {
      field: "name",
      headerName: "Team",
      width: 80,
      sortable: false,
      cellRenderer: (props) => {
        const { node, colDef } = props;
        const isOtherFirstCol = clickedCell?.colId !== colDef.field;
        const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

        const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
        const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;
        if (
          (clickedCell && isOtherFirstCol && isSameFirstRow) ||
          (secondClickedCell && isOtherSecondCol && isSameSecondRow)
        ) {
          return (
            <div className="team-name">
              <div className="red-bar-horizontal" />
              {props.value}
            </div>
          );
        }

        return <div className="team-name">{props.value}</div>;
      },
      flex: 1,
      pinned: "left",
    },
    // { field: "ev", headerName: "EV", width: 56, flex: 1 },
    {
      field: "win_probability",
      headerName: "W%",
      sortable: false,
      cellRenderer: (props) => {
        const { node, colDef } = props;
        const isOtherFirstCol = clickedCell?.colId !== colDef.field;
        const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

        const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
        const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;
        if (
          (clickedCell && isOtherFirstCol && isSameFirstRow) ||
          (secondClickedCell && isOtherSecondCol && isSameSecondRow)
        ) {
          return (
            <div className="win-percent">
              <div className="red-bar-horizontal" />
              {`${props.value}%`}
            </div>
          );
        }

        return <div className="win-percent">{`${props.value}%`}</div>;
      },
      width: 56,
      flex: 1,
      pinned: "left",
    },
    {
      field: "p_percent",
      headerName: "P%",
      sortable: false,
      cellRenderer: (props) => {
        const { node, colDef } = props;
        const isOtherFirstCol = clickedCell?.colId !== colDef.field;
        const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

        const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
        const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;

        if (
          (clickedCell && isOtherFirstCol && isSameFirstRow) ||
          (secondClickedCell && isOtherSecondCol && isSameSecondRow)
        ) {
          return (
            <div className="pick-percent">
              <div className="red-bar-horizontal" />
              {`${props.value}%`}
            </div>
          );
        }

        return <div className="pick-percent">{`${props.value}%`}</div>;
      },
      // width: 56,
      flex: 1,
    },
  ]);

  useEffect(() => {
    fetchLoginInfo();
  }, []);

  useEffect(() => {
    fetchTeamMemberList();
  }, []);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchFullWeekSchedule();
      fetchLoginInfo();
    }
  }, [teamMembers]);

  const fetchLoginInfo = () => {
    return;
    fetch(WP_API.root + "custom/v1/user-status", {
      method: "GET",
      headers: {
        "X-WP-Nonce": WP_API.nonce,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
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
    if (!clickedCell) return "";

    const isFirstClickedCellCol = params.colDef.field === clickedCell.colId;
    const isFirstClickedCellRow = params.rowIndex === clickedCell.rowIndex;

    // if (currentEntry.teams_used.includes(params.data.name)) {
    //   return "cell-selected";
    // }

    if (isFirstClickedCellCol && isFirstClickedCellRow) {
      return "cell-selected";
    }

    if (!secondClickedCell) return "";

    const isSecondClickedCellCol =
      params.colDef.field === secondClickedCell.colId;
    const isSecondClickedCellRow =
      params.rowIndex === secondClickedCell.rowIndex;
    if (isSecondClickedCellCol && isSecondClickedCellRow) {
      return "cell-selected";
    }

    return "";
  };

  const customColDefs = useMemo(() => {
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
          const pointA = nodeA.data[`week${weekNum}`]?.point ?? 0;
          const pointB = nodeB.data[`week${weekNum}`]?.point ?? 0;
          return pointA - pointB;
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isSameFirstCol = clickedCell?.colId === colDef.field;
          const isOtherFirstCol = clickedCell?.colId !== colDef.field;
          const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;
          const isOtherFirstRow = clickedCell?.rowIndex !== node.rowIndex;

          const isSameSecondCol = secondClickedCell?.colId === colDef.field;
          const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
          const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;
          const isOtherSecondRow =
            secondClickedCell?.rowIndex !== node.rowIndex;

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
              {isOtherFirstCol && isSameFirstRow && (
                <div className="red-bar-horizontal" />
              )}
              {isOtherSecondCol && isSameSecondRow && (
                <div className="red-bar-horizontal" />
              )}
              {isSameFirstCol && isOtherFirstRow && (
                <div
                  className={`red-bar ${
                    isSameSecondCol && isSameSecondRow ? "hide-red-bar" : ""
                  }`}
                />
              )}
              {isSameSecondCol && isOtherSecondRow && (
                <div
                  className={`red-bar ${
                    isSameFirstCol && isSameFirstRow ? "hide-red-bar" : ""
                  }`}
                />
              )}
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
        flex: 1,
      }));
    return [
      {
        field: "name",
        headerName: "Team",
        width: 80,
        sortable: false,
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isOtherFirstCol = clickedCell?.colId !== colDef.field;
          const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

          const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
          const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;
          if (
            (clickedCell && isOtherFirstCol && isSameFirstRow) ||
            (secondClickedCell && isOtherSecondCol && isSameSecondRow)
          ) {
            return (
              <div className="team-name">
                <div className="red-bar-horizontal" />
                {props.value}
              </div>
            );
          }

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
        sortable: false,
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isOtherFirstCol = clickedCell?.colId !== colDef.field;
          const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

          const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
          const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;
          if (
            (clickedCell && isOtherFirstCol && isSameFirstRow) ||
            (secondClickedCell && isOtherSecondCol && isSameSecondRow)
          ) {
            return (
              <div className="win-percent">
                <div className="red-bar-horizontal" />
                {`${props.value}%`}
              </div>
            );
          }

          return (
            <div className="win-percent">
              {currentEntry.teams_used.includes(props.data.name) && (
                <div className="red-bar-horizontal" />
              )}
              {`${props.value}%`}
            </div>
          );
        },
        width: 56,
        flex: 1,
        pinned: "left",
      },
      {
        field: "p_percent",
        headerName: "P%",
        sortable: false,
        cellClassRules: {
          "cell-disabled": (params) => isDisabled(params),
        },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isOtherFirstCol = clickedCell?.colId !== colDef.field;
          const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

          const isOtherSecondCol = secondClickedCell?.colId !== colDef.field;
          const isSameSecondRow = secondClickedCell?.rowIndex === node.rowIndex;

          if (
            (clickedCell && isOtherFirstCol && isSameFirstRow) ||
            (secondClickedCell && isOtherSecondCol && isSameSecondRow)
          ) {
            return (
              <div className="pick-percent">
                <div className="red-bar-horizontal" />
                {`${props.value}%`}
              </div>
            );
          }
          return (
            <div className="pick-percent">
              {currentEntry.teams_used.includes(props.data.name) && (
                <div className="red-bar-horizontal" />
              )}
              {`${props.value}%`}
            </div>
          );
        },
        // width: 56,
        flex: 1,
      },
      ...weekCols,
    ];
  }, [showOptions, currentWeek, clickedCell, secondClickedCell, currentEntry]);

  const fetchTeamMemberList = async () => {
    try {
      const { data } = await API.get("/team-member-list");
      setTeamMembers(data);
    } catch (e) {
      console.log(e);
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
    setLoading(true);
    try {
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

          row[`week${game.Week}`].dateTime = game.DateTime;

          if (game.AwayTeam !== "BYE") {
            const homeTeamInfo = teamMembers.find((t) => t.TeamID === team.id);
            const awayTeamInfo = teamMembers.find(
              (t) => t.TeamID === game.GlobalAwayTeamID
            );
            if (homeTeamInfo && awayTeamInfo) {
              if (homeTeamInfo.Division === awayTeamInfo.Division)
                row[`week${game.Week}`].type = "sd";
              if (homeTeamInfo.Conference === awayTeamInfo.Conference)
                row[`week${game.Week}`].type = "sc";
            }
          }
        });
        customRows.push(row);
      });
      setRowData(customRows);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const handleChangeWeek = (value, option) => {
    setCurrentWeek(option);
    setClickedCell(null);
    setSecondClickedCell(null);
    setCurrentEntry({
      ...currentEntry,
      team1: "",
      team2: "",
      week: value,
    });
  };

  const handleToggle = (checked, type) => {
    setShowOptions({
      ...showOptions,
      [type]: checked,
    });
  };

  const handleChangeEntry = (e) => {
    setCurrentEntry({
      ...currentEntry,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEntry = async () => {
    try {
      const payload = {
        ...currentEntry,
        week: currentWeek.value,
        user: loggedUser,
      };
      if (loadedEntries.find((item) => item.id === currentEntry.id)) {
        const { data } = await API.put(`/entry/${currentEntry.id}`, payload);
        console.log(data);
        if (data.success) {
          setSaved(true);
          api.success({
            message: "Entry Updated",
            description: "Your current entry has been updated successfully.",
          });
          handleLoadEntry();
        }
      } else {
        const { data } = await API.post("/entry", payload);
        console.log(data);
        if (data.success) {
          setSaved(true);
          api.success({
            message: "Entry Created",
            description: "Your new entry has been saved successfully.",
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleLoadEntry = async () => {
    if (loggedUser) {
      setLoadedEntries([]);
      setCurrentEntry({
        id: "",
        name: "",
        doublePicksStart: 0,
        team1: "",
        team2: null,
        teams_used: [],
        hide_on_grid: false,
        week: 1,
      });
      try {
        const { data } = await API.get(`/entry/${loggedUser.user.id}`);
        setLoadedEntries(data);
        api.success({
          message: "Entries Loaded",
          description: "All saved entries have been loaded successfully.",
        });
        setEntryLoaded(true);
      } catch (e) {
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
      team1: "",
      team2: "",
      teams_used: null,
      hide_on_grid: false,
      week: 1,
    });
    setClickedCell(null);
    setSecondClickedCell(null);
  };

  const handleChangeDoublePicks = (value, option) => {
    setCurrentEntry({
      ...currentEntry,
      doublePicksStart: value,
    });
  };

  const handleChangeCurrentEntry = (value, option) => {
    setCurrentEntry(option);

    if (option.team1) {
      const rowIndex = rowData.findIndex((item) => item.name === option.team1);
      setClickedCell({
        rowIndex,
        colId: `week${option.week}`,
      });
    }

    if (option.team2) {
      const rowIndex = rowData.findIndex((item) => item.name === option.team2);
      setSecondClickedCell({
        rowIndex,
        colId: `week${option.doublePicksStart}`,
      });
    }
  };

  const handleChangeTeamsUsed = (value, option) => {
    setCurrentEntry({
      ...currentEntry,
      teams_used: value,
    });
  };

  const handleChangeHideOnGrid = (e) => {
    setCurrentEntry({
      ...currentEntry,
      hide_on_grid: e.target.checked,
    });
  };

  const isDisabled = (params) => {
    if (!clickedCell) return false;
    if (secondClickedCell) {
      return (
        params.rowIndex === clickedCell.rowIndex ||
        params.rowIndex === secondClickedCell.rowIndex ||
        currentEntry.teams_used.includes(params.data.name)
      );
    } else {
      return (
        params.rowIndex === clickedCell.rowIndex ||
        currentEntry.teams_used.includes(params.data.name)
      );
    }
  };

  const handleCellClick = (event) => {
    console.log(event);
    if (event.colDef.field === "name") {
      let customTeamsUsed = [...currentEntry.teams_used];
      if (customTeamsUsed.includes(event.data.name)) {
        customTeamsUsed = customTeamsUsed.filter(
          (item) => item !== event.data.name
        );
      } else {
        customTeamsUsed.push(event.data.name);
      }
      setCurrentEntry({
        ...currentEntry,
        teams_used: customTeamsUsed,
      });
    }
    if (!event.colDef.field.includes("week")) return;

    if (
      clickedCell &&
      currentEntry.doublePicksStart === 0 &&
      event.rowIndex === clickedCell.rowIndex &&
      event.colDef.field === clickedCell.colId
    ) {
      setClickedCell(null);
      return;
    }

    if (
      secondClickedCell &&
      currentEntry.doublePicksStart > 0 &&
      event.rowIndex === secondClickedCell.rowIndex &&
      event.colDef.field === secondClickedCell.colId
    ) {
      setSecondClickedCell(null);
      return;
    }

    if (
      currentEntry.doublePicksStart > 0 &&
      clickedCell &&
      event.rowIndex === clickedCell.rowIndex
    ) {
      modal.confirm({
        title: "Error!",
        icon: <ExclamationCircleOutlined />,
        content:
          "The team of the second pick should different with the first pick",
      });
      return;
    }

    if (currentEntry.doublePicksStart === 0) {
      setClickedCell({
        rowIndex: event.rowIndex,
        colId: event.colDef.field,
      });
      setCurrentEntry({
        ...currentEntry,
        team1: event.data.name,
      });
    } else {
      if (!clickedCell) {
        setClickedCell({
          rowIndex: event.rowIndex,
          colId: event.colDef.field,
        });
        setCurrentEntry({
          ...currentEntry,
          team1: event.data.name,
        });
      } else {
        setSecondClickedCell({
          rowIndex: event.rowIndex,
          colId: event.colDef.field,
        });
        setCurrentEntry({
          ...currentEntry,
          team2: event.data.name,
        });
      }
    }
  };

  const handleChangeEntryName = (e) => {
    setCurrentEntry({
      ...currentEntry,
      name: e.target.value,
    });
  };

  console.log(loadedEntries, rowData);
  return (
    <AppWrapper>
      {contextHolder}
      {modalContextHolder}
      <TopWrapper>
        <AppTitle>NFL Survivor Grid - {currentWeek.label}</AppTitle>
        <Links>
          <a
            href="https://www.rotoballer.com/nfl-survivor-pool-strategy-expert-tips-for-survivor-leagues/1519975"
            target="_blank"
          >
            Survivor Strategy
          </a>
          <a
            href="https://www.rotoballer.com/survivor-pool-aggregate-consensus-picks-and-data"
            target="_blank"
          >
            Consensus Picks
          </a>
          <a
            href="https://www.rotoballer.com/nfl-survivor-pool-strategy-expert-tips-for-survivor-leagues/1519975"
            target="_blank"
          >
            Knockout Data
          </a>
        </Links>
      </TopWrapper>
      {loggedUser && (
        <Card
          title={
            <EntryButtons>
              <div>Your Saved Entries</div>
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
            </EntryButtons>
          }
          extra={"(click games on the grid to highlight)"}
          style={{ width: "100%", marginTop: "20px" }}
        >
          <PanelWrapper>
            <EntryButtons>
              <div>
                <div>Entry Name</div>
                <Input
                  value={currentEntry.name}
                  onChange={handleChangeEntryName}
                  style={{ width: "170px" }}
                />
              </div>
            </EntryButtons>
            <EntryButtons>
              <Button
                type="primary"
                onClick={handleSaveEntry}
                disabled={!currentEntry.name}
              >
                Save
              </Button>

              <Button type="primary" onClick={handleLoadEntry}>
                Load
              </Button>
              <Popconfirm
                title="Delete the entry"
                description="Are you sure to delete this entry?"
                onConfirm={handleRemoveEntry}
                okText="Yes"
                cancelText="No"
              >
                <Button danger disabled={!currentEntry.name}>
                  Delete
                </Button>
              </Popconfirm>

              <Button onClick={handleClearEntry}>Clear</Button>
            </EntryButtons>
          </PanelWrapper>
          <PanelWrapper>
            <div>
              <div>Double Picks Start</div>
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
                <div>Teams Used</div>
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
                disabled={currentWeek.value === 1}
                allowClear
                style={{ width: "100%" }}
              />
            </div>
          </PanelWrapper>
        </Card>
      )}

      <FilterWrapper>
        <Select
          prefix={<img src={Calendar} width="15px" height="16px" alt="" />}
          options={fullWeeks}
          value={currentWeek.value}
          onChange={handleChangeWeek}
          style={{ width: "170px", height: "44px", margin: "10px 0px" }}
        />
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
      </FilterWrapper>
      <GridWrapper>
        <AgGridReact
          rowData={rowData}
          columnDefs={customColDefs}
          loading={loading}
          rowHeight={41}
          headerHeight={41}
          onCellClicked={handleCellClick}
        />
      </GridWrapper>
    </AppWrapper>
  );
}

export default App;
