import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component

import "./App.css";
import { API, setAPIBaseURL } from "./services/ApiService";
import { Button, Card, Checkbox, Input, Select, Switch } from "antd";
import Calendar from "./assets/calendar.png";
import {
  AppTitle,
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
  const [currentEntry, setCurrentEntry] = useState({
    name: "",
    doublePicksStart: "never",
    teams_used: "",
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
    },
    { field: "ev", headerName: "OP", width: 60 },
    {
      field: "win_probability",
      headerName: "W%",
      cellRenderer: (props) => `${props.value}%`,
      width: 70,
    },
    {
      field: "p_percent",
      headerName: "P%",
      cellRenderer: (props) => `${props.value}%`,
      width: 70,
    },
  ]);

  useEffect(() => {
    // fetchLoginInfo();
  }, []);

  useEffect(() => {
    fetchTeamMemberList();
  }, []);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchFullWeekSchedule();
      // fetchLoginInfo();
    }
  }, [teamMembers]);

  // const fetchLoginInfo = () => {
  //   fetch(WP_API.root + "custom/v1/user-status", {
  //     method: "GET",
  //     headers: {
  //       "X-WP-Nonce": WP_API.nonce,
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data);
  //       setLoggedUser(data);
  //     });
  // };

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

    if (!className.includes("gray")) {
      const point = cellData.point;
      if (point <= 3) {
        className += " step-1";
      } else if (point > 3 && point <= 7) {
        className += " step-2";
      } else if (point > 7 && point <= 10) {
        className += " step-3";
      } else if (point > 10 && point <= 13) {
        className += " step-4";
      } else if (point > 13) {
        className += " step-5";
      }
    }

    return className;
  };

  const customColDefs = useMemo(() => {
    let customColumns = [...colDefs];
    const weekCols = Array.from({ length: 18 }, (_, i) => i + 1)
      .filter((weekNum) => weekNum >= currentWeek.value)
      .map((weekNum) => ({
        headerName: `${weekNum}`,
        field: `week${weekNum}`,
        cellRenderer: (props) => (
          <div className={getClassName(props.data[`week${weekNum}`])}>
            <div className="name-value">
              {props.data[`week${weekNum}`].name}
            </div>
            <div className="point-value">
              {props.data[`week${weekNum}`].point}
            </div>
          </div>
        ),
        width: 80,
      }));
    6787931446;
    return [...customColumns, ...weekCols];
  }, [showOptions, currentWeek]);

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

  const handleSaveEntry = () => {};
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
    });
  };

  console.log("currentEntry", currentEntry, fullWeeks);

  return (
    <>
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
        />
      </GridWrapper>
    </>
  );
}

export default App;
