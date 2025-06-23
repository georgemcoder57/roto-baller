import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component

import "./App.css";
import { API, setAPIBaseURL } from "./services/ApiService";
import { Select, Switch } from "antd";
import Calendar from "./assets/calendar.png";
import { FULL_WEEKS } from "./data";
import {
  AppTitle,
  GridWrapper,
  ToolOutline,
  ToolText,
  TopWrapper,
} from "./styles";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const [currentWeek, setCurrentWeek] = useState({
    label: "Week 1",
    value: 1,
  });
  const [fullWeeks, setFullWeeks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kickOffTime, setKickOffTime] = useState([]);
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
    { field: "name", headerName: "Team", width: 80 },
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
    fetchTeamMemberList();
  }, []);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchFullWeekSchedule();
    }
  }, [teamMembers]);

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
    return [...customColumns, ...weekCols];
  }, [showOptions, currentWeek]);

  const fetchTeamMemberList = async () => {
    try {
      setAPIBaseURL(
        "https://api.sportsdata.io/v3/nfl/scores/json/TeamsBasic?key=df0a8ea9a7b949e098fba1d12543bf3f"
      );
      const { data } = await API.get();
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

  const fetchKickOffTime = async () => {
    try {
      setAPIBaseURL(
        "https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2025?key=df0a8ea9a7b949e098fba1d12543bf3f"
      );
      const { data } = await API.get();
      setKickOffTime(data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchFullWeekSchedule = async () => {
    setLoading(true);
    try {
      setAPIBaseURL(
        "https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2025?key=df0a8ea9a7b949e098fba1d12543bf3f"
      );
      const { data } = await API.get();
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
      console.log("transformedData", transformedData);
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

  return (
    <>
      <AppTitle>NFL Survivor Grid - {currentWeek.label}</AppTitle>
      <TopWrapper>
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
      </TopWrapper>
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
