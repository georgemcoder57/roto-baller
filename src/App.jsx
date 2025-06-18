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
  const [fullWeekSchedule, setFullWeekSchedule] = useState([]);
  const [rowData, setRowData] = useState([
    {
      teamName: "ARI",
      opponents: "TEN",
      wp: 75.6,
      cp: 0.4,
      ev: 1.2,
      fv: 4,
    },
    {
      teamName: "ARI",
      opponents: "TEN",
      wp: 75.6,
      cp: 0.4,
      ev: 1.2,
      fv: 4,
    },
    {
      teamName: "ARI",
      opponents: "TEN",
      wp: 75.6,
      cp: 0.4,
      ev: 1.2,
      fv: 4,
    },
    {
      teamName: "ARI",
      opponents: "TEN",
      wp: 75.6,
      cp: 0.4,
      ev: 1.2,
      fv: 4,
    },
    {
      teamName: "ARI",
      opponents: "TEN",
      wp: 75.6,
      cp: 0.4,
      ev: 1.2,
      fv: 4,
    },
  ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    { field: "teamName", headerName: "Team Name" },
    { field: "opponents", headerName: "Opponents" },
    {
      field: "wp",
      headerName: "Win probability",
      cellRenderer: (props) => `${props.value}%`,
    },
    {
      field: "cp",
      headerName: "Consensus pick",
      cellRenderer: (props) => `${props.value}%`,
    },
    { field: "ev", headerName: "Expected value" },
    { field: "fv", headerName: "Future value" },
  ]);

  useEffect(() => {
    fetchTeamMemberList();
    fetchFullWeekSchedule();
  }, []);

  const fetchTeamMemberList = async () => {
    try {
      setAPIBaseURL(
        "https://api.sportsdata.io/v3/nfl/scores/json/TeamsBasic?key=df0a8ea9a7b949e098fba1d12543bf3f"
      );
      const { data } = await API.get();
      console.log("Team master list", data);
      setTeamMembers(data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchFullWeekSchedule = async () => {
    try {
      setAPIBaseURL(
        "https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2025?key=df0a8ea9a7b949e098fba1d12543bf3f"
      );
      const { data } = await API.get();
      console.log("Full 18-week schedule", data);
      setFullWeekSchedule(data);
    } catch (e) {
      console.log(e);
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
      <div style={{ height: 500 }}>
        <AgGridReact rowData={rowData} columnDefs={colDefs} />
      </div>
    </>
  );
}

export default App;
