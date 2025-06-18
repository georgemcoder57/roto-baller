import { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component

import "./App.css";
import { API, setAPIBaseURL } from "./services/ApiService";
import { Select } from "antd";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const [teamMembers, setTeamMembers] = useState([]);
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
  }, []);

  const fetchTeamMemberList = async () => {
    try {
      const { data } = await API.get();
      setTeamMembers(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div>Team Members</div>
      <Select
        options={teamMembers}
        fieldNames={{
          label: "FullName",
          value: "Key",
        }}
        style={{ width: "300px", margin: "10px 0px" }}
      />
      <div style={{ height: 500 }}>
        <AgGridReact rowData={rowData} columnDefs={colDefs} />
      </div>
    </>
  );
}

export default App;
