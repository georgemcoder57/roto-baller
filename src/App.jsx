import { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component

import "./App.css";
import { API, setAPIBaseURL } from "./services/ApiService";
import { Select, Switch } from "antd";
import Calendar from "./assets/calendar.png";
import { FULL_WEEKS } from "./data";
import { AppTitle, ToolOutline, ToolText, TopWrapper } from "./styles";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const [currentWeek, setCurrentWeek] = useState({
    label: "Week 1",
    value: 1,
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullWeekSchedule, setFullWeekSchedule] = useState([]);
  const [kickOffTime, setKickOffTime] = useState([]);
  const [spit, setSpit] = useState([]);
  const [rowData, setRowData] = useState([]);

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
    customColDefs();
  }, []);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchFullWeekSchedule();
    }
  }, [teamMembers]);

  const customColDefs = () => {
    let customColumns = [...colDefs];
    const weekCols = Array.from({ length: 18 }, (_, i) => ({
      headerName: `${i + 1}`,
      cellRenderer: (props) => (
        <div
          className={`${
            props.data[`week${i + 1}`].type
              ? props.data[`week${i + 1}`].type
              : "normal"
          }`}
        >
          <div className="name-value">{props.data[`week${i + 1}`].name}</div>
          <div className="point-value">{props.data[`week${i + 1}`]?.point}</div>
        </div>
      ),
      width: 70,
    }));
    setColDefs([...customColumns, ...weekCols]);
  };

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
            row[`week${game.Week}`].name = "@ " + game.HomeTeam;
            row[`week${game.Week}`].point = (-game.PointSpread || 0).toString(); // point spread is referring to home team
          } else if (game.AwayTeam == "BYE") {
            // a "BYE" in not a game + no teams called "BYE"
            row[`week${game.Week}`].name = "BYE";
          } else {
            row[`week${game.Week}`].name = game.AwayTeam;
            row[`week${game.Week}`].point = (game.PointSpread || 0).toString(); // point spread is referring to home team
          }

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
      console.log("---------", customRows);
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

  return (
    <>
      <AppTitle>NFL Survivor Grid - {currentWeek.label}</AppTitle>
      <TopWrapper>
        <Select
          prefix={<img src={Calendar} width="15px" height="16px" alt="" />}
          options={FULL_WEEKS}
          value={currentWeek.value}
          onChange={handleChangeWeek}
          style={{ width: "170px", height: "44px", margin: "10px 0px" }}
        />
        <ToolOutline>
          <Switch />
          <ToolText>Away Games</ToolText>
        </ToolOutline>
        <ToolOutline>
          <Switch />
          <ToolText>Divisional Games</ToolText>
        </ToolOutline>
        <ToolOutline>
          <Switch />
          <ToolText>Thursday Games</ToolText>
        </ToolOutline>
        <ToolOutline>
          <Switch />
          <ToolText>Monday Games</ToolText>
        </ToolOutline>
        <ToolOutline>
          <Switch />
          <ToolText>Spreads</ToolText>
        </ToolOutline>
      </TopWrapper>
      <div style={{ height: 750 }}>
        <AgGridReact rowData={rowData} columnDefs={colDefs} loading={loading} />
      </div>
    </>
  );
}

export default App;
