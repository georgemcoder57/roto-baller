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
  notification,
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

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const [api, contextHolder] = notification.useNotification();
  const [clickedCell, setClickedCell] = useState(null);
  const [secondClickedCell, setSecondClickedCell] = useState(null);
  const [currentEntry, setCurrentEntry] = useState({
    name: "",
    doublePicksStart: 0,
    team1: "",
    team2: null,
    teams_used: [],
    hide_on_grid: false,
  });
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentWeek, setCurrentWeek] = useState({
    label: "Week 1",
    value: 1,
  });
  const [fullWeeks, setFullWeeks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
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
      cellRenderer: (props) => <div className="team-name">{props.value}</div>,
      flex: 1,
      // pinned: "left",
    },
    // { field: "ev", headerName: "EV", width: 56, flex: 1 },
    {
      field: "win_probability",
      headerName: "W%",
      cellRenderer: (props) => `${props.value}%`,
      width: 56,
      flex: 1,
      // pinned: "left",
    },
    {
      field: "p_percent",
      headerName: "P%",
      cellRenderer: (props) => `${props.value}%`,
      width: 56,
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
    let customColumns = [...colDefs];
    const weekCols = Array.from({ length: 18 }, (_, i) => i + 1)
      .filter((weekNum) => weekNum >= currentWeek.value)
      .map((weekNum) => ({
        headerName: `${weekNum}`,
        field: `week${weekNum}`,
        cellClass: (params) => getCellClass(params),
        // cellClassRules: {
        //   "cell-disabled": (params) => isDisabled(params),
        // },
        cellRenderer: (props) => {
          const { node, colDef } = props;
          const isSameFirstCol = clickedCell?.colId === colDef.field;
          const isOtherFirstRow = clickedCell?.rowIndex !== node.rowIndex;
          const isSameFirstRow = clickedCell?.rowIndex === node.rowIndex;

          const isSameSecondCol = secondClickedCell?.colId === colDef.field;
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
    return [...customColumns, ...weekCols];
  }, [showOptions, currentWeek, clickedCell, secondClickedCell]);

  const fetchTeamMemberList = async () => {
    try {
      const { data } = await API.get("/team-member-list");
      console.log(data);
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
      console.log("--------", transformedData);
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

  const handleSaveEntry = () => {
    setCurrentEntry({
      ...currentEntry,
      user: loggedUser,
    });
    console.log(currentEntry);
  };
  const handleSaveAsEntry = () => {
    setCurrentEntry({
      ...currentEntry,
      name: "",
    });
  };
  const handleLoadEntry = () => {};
  const handleClearEntry = () => {
    setCurrentEntry({
      name: "",
      doublePicksStart: 0,
      hide_on_grid: false,
      teams_used: null,
    });
  };
  const handleChangeDoublePicks = (value, option) => {
    setCurrentEntry({
      ...currentEntry,
      doublePicksStart: value,
    });
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
      week: currentWeek.value,
    });
  };

  const isDisabled = (params) => {
    if (!clickedCell || currentEntry.doublePicksStart > 0) return false;
    return params.rowIndex !== clickedCell.rowIndex;
  };

  const handleCellClick = (event) => {
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
      api.error({
        message: "Error!",
        description:
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

  return (
    <AppWrapper>
      {contextHolder}
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
      <Card
        title="Your Saved Entries"
        extra={"(click games on the grid to highlight)"}
        style={{ width: "100%", marginTop: "20px" }}
      >
        <PanelWrapper>
          <Input
            value={currentEntry.name}
            onChange={(e) => handleChangeEntry(e)}
            style={{ width: "250px" }}
            placeholder="New Entry Name"
            name="name"
          />
          <EntryButtons>
            <Button
              type="primary"
              onClick={handleSaveEntry}
              disabled={!currentEntry.name}
            >
              Save
            </Button>
            <Button onClick={handleSaveAsEntry}>Save As</Button>
            <Button type="primary" onClick={handleLoadEntry}>
              Load
            </Button>
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
