import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { BrowserView, isMobile, MobileView } from "react-device-detect";

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
  const [showAllSettings, setShowAllSettings] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [modal, modalContextHolder] = Modal.useModal();
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
  const [loggedUser, setLoggedUser] = useState({
    logged_in: true,
    user: {
      id: 132865,
      name: "George Coder",
      email: "GeorgeMCoder57@gmail.com",
    },
  });
  const [currentWeek, setCurrentWeek] = useState();
  const [fullWeeks, setFullWeeks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
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
    if (loggedUser.logged_in) {
      handleLoadEntry();
    }
  }, [loggedUser]);

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
          const pointA = nodeA.point ?? 0;
          const pointB = nodeB.point ?? 0;
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
              {!isCurrentCell && isSameCol && <div className={`red-bar`} />}
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
    return [
      {
        field: "name",
        headerName: "Team",
        width: 80,
        sortable: false,
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
        sortable: false,
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
        sortable: false,
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
  }, [showOptions, currentWeek, currentEntry, isMobile]);

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
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
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

  const onGridReady = (params) => {
    setGridApi(params.api);
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
        if (data.success) {
          setSaved(true);
          api.success({
            message: "Entry Updated",
            description: "Your current entry has been updated successfully.",
            placement: "bottomRight",
          });
          handleLoadEntry();
        }
      } else {
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
      }
    } catch (e) {
      console.log(e);
      api.error({
        message: "Failed!",
        description: e.response.data.error,
        placement: "bottomRight",
      });
    }
  };

  const handleCreateEntry = async () => {
    try {
      const payload = {
        ...currentEntry,
        week: currentWeek.value,
        user: loggedUser,
      };

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
    } catch (e) {
      console.log(e);
      api.error({
        message: "Failed!",
        description: e.response.data.error,
        placement: "bottomRight",
      });
    }
  };

  const handleLoadEntry = async () => {
    if (loggedUser) {
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
          api.success({
            message: "Entries Loaded",
            description: "All saved entries have been loaded successfully.",
            placement: "bottomRight",
          });
        }
        setIsDirty(false);
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
    };

    if (cellData.colId === "name") {
      if (
        currentEntry.clicked_cells.find((item) => item.team === cellData.team)
      ) {
        return;
      }

      setIsDirty(true);

      let customTeamsUsed = [...currentEntry.teams_used];
      if (customTeamsUsed.includes(cellData.team)) {
        customTeamsUsed = customTeamsUsed.filter(
          (item) => item !== cellData.team
        );
      } else {
        customTeamsUsed.push(cellData.team);
      }
      setCurrentEntry({
        ...currentEntry,
        teams_used: customTeamsUsed,
      });
    }
    if (!cellData.colId.includes("week")) return;

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
      if (cellData.week >= currentEntry.doublePicksStart) {
        if (
          !currentEntry.clicked_cells.find(
            (item) =>
              item.colId === cellData.colId &&
              item.rowIndex === cellData.rowIndex
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
              item.colId === cellData.colId &&
              item.rowIndex === cellData.rowIndex
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
      }
    }
  };

  const handleChangeEntryName = (e) => {
    setIsDirty(true);
    setCurrentEntry({
      ...currentEntry,
      name: e.target.value,
    });
  };

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

    if (currentEntry.hide_on_grid) {
      return customData.filter(
        (item) => !currentEntry.teams_used.includes(item.name)
      );
    }

    return customData;
  }, [currentEntry.hide_on_grid, rowData, currentEntry.teams_used, pickData]);

  useEffect(() => {
    fetchPickPercentages();
  }, [currentWeek]);

  const fetchPickPercentages = async () => {
    try {
      const { data } = await API.get(
        `/entry/calculate-pick/${currentWeek.value}`
      );
      setPickData(data);
      console.log("------------", data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleShowAllSettings = () => {
    setShowAllSettings(!showAllSettings);
  };

  return (
    <AppWrapper>
      {contextHolder}
      {modalContextHolder}
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
      <Card
        title={
          <EntryTitle>
            <div className="entry-title">Your Saved Entries</div>
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
        extra={"(click games on the grid to highlight)"}
        style={{ width: "100%" }}
      >
        <PanelWrapper>
          <EntryButtons>
            <div>
              <div className="entry-name">Entry Name</div>
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
              disabled={!currentEntry.name || !loggedUser.logged_in || !isDirty}
            >
              Save
            </Button>
            <Button
              type="primary"
              onClick={handleCreateEntry}
              disabled={!currentEntry.name || !loggedUser.logged_in || !isDirty}
            >
              Save As
            </Button>

            {/* <Button
              type="primary"
              onClick={handleLoadEntry}
              disabled={!loggedUser.logged_in}
            >
              Load
            </Button> */}
            <Popconfirm
              title="Delete the entry"
              description="Are you sure to delete this entry?"
              onConfirm={handleRemoveEntry}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                disabled={!currentEntry.name || !loggedUser.logged_in}
              >
                Delete
              </Button>
            </Popconfirm>

            <Button onClick={handleClearEntry} disabled={!loggedUser.logged_in}>
              Clear
            </Button>
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
              disabled={!loggedUser.logged_in}
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
                  disabled={!loggedUser.logged_in}
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
              disabled={currentWeek?.value === 1 || !loggedUser.logged_in}
              allowClear
              style={{ width: "100%" }}
            />
          </div>
        </PanelWrapper>
      </Card>

      <FilterWrapper>
        <Select
          prefix={<img src={Calendar} width="15px" height="16px" alt="" />}
          options={fullWeeks}
          value={currentWeek ? currentWeek.value : undefined}
          onChange={handleChangeWeek}
          style={{ width: "170px", height: "48px", margin: "10px 0px" }}
        />
        {isMobile ? (
          <div className="all-button" onClick={() => handleShowAllSettings()}>
            <img src={MenuIcon} alt="" width="20px" height="20px" />
            <div className="all-button-text">All Settings</div>
          </div>
        ) : (
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
        )}
      </FilterWrapper>
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
      <GridWrapper>
        <AgGridReact
          rowData={filteredData}
          columnDefs={customColDefs}
          loading={loading}
          rowHeight={41}
          headerHeight={41}
          onCellClicked={handleCellClick}
          onGridReady={onGridReady}
          defaultColDef={{
            sortable: true,
            sortingOrder: ["asc", "desc"], // disables 3rd state
            suppressMovable: true,
          }}
        />
      </GridWrapper>
    </AppWrapper>
  );
}

export default App;
