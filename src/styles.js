import styled from "styled-components";

export const AppWrapper = styled.div`
  border: none !important;
`;

export const FilterWrapper = styled.div`
  display: flex;
  margin: 16px 0px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  .ant-select-selector {
    border-radius: 32px;
  }

  .ant-select-prefix {
    height: 16px;
  }
`;

export const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
`;

export const Links = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  a {
    font-weight: 500;
    font-size: 18px;
    text-decoration: none;
    color: #006dc8;
  }
`;

export const ToolOutline = styled.div`
  width: 218px;
  border-radius: 32px;
  border: 1px solid #dadada;
  padding: 12px 16px;
  padding-left: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
`;

export const ToolText = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 100%;
  color: black;
`;

export const AppTitle = styled.div`
  font-weight: 700;
  font-size: 38px;
  line-height: 100%;
`;

export const GridWrapper = styled.div`
  height: 1365px;

  .ag-header-cell-resize {
    &:after {
      height: 100%;
      width: 1px;
      top: 0;
      right: 3px;
      left: auto;
    }
  }
  .red-bar-horizontal {
    width: 100%;
    height: 1px;
    background: red;
    position: absolute;
    top: 50%;
  }

  .red-bar {
    width: 1px;
    height: 100%;
    background-color: red;
    position: absolute;
    left: 50%;
  }

  .win-percent,
  .pick-percent {
    position: relative;
  }

  .red-bar.hide-red-bar {
    display: none;
  }

  .ag-cell.cell-selected {
    font-weight: bold;
    border: 1px solid red;
    box-sizing: border-box;
  }

  .cell-disabled {
    pointer-events: none;
    opacity: 0.4;
    cursor: not-allowed;
  }

  .ag-theme-params-1,
  .ag-theme-params-5 {
    border: none !important;
  }

  .ag-row {
    border-bottom: none;
  }

  .ag-cell {
    border: 1px solid #ededed;
  }

  .ag-header-cell {
    padding: 0 !important;
  }
  .ag-header-cell-label {
    justify-content: center;
  }

  .ag-header-cell-text {
    font-weight: bold;
  }

  .team-name {
    background: #006dc8;
    color: white;
    text-align: center;
    font-weight: bold;
    height: 100%;
  }

  .team-name.cell-selected {
    border: 2px solid red;
    box-sizing: border-box;
  }

  .ag-column-first {
    border: none;
  }
  .sd,
  .sc,
  .normal {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .name-value {
    font-size: 14px;
    font-weight: 500;
    color: black;
  }

  .point-value {
    position: absolute;
    right: 2px;
    bottom: 2px;
    font-size: 10px;
    font-weight: 500;
    color: #797979;
    line-height: 100%;
  }

  .ag-cell {
    padding: 0;
    text-align: center;
  }

  .hide-spreads .point-value {
    display: none;
  }

  .show-spreads .point-value {
    display: block;
  }

  .show-spreads,
  .hide-spreads {
    position: relative;
  }

  .gray {
    background: lightgray;
    position: relative;
  }

  .gray .name-value {
    color: #b0b0b0;
  }

  .gray .point-value {
    color: #b0b0b0;
  }

  .step-1 {
    background: #fdfffd;
  }

  .step-2 {
    background: #d5ffd5;
  }
  .step-3 {
    background: #aeffae;
  }
  .step-4 {
    background: #82ff82;
  }
  .step-5 {
    background: #4cff4c;
  }
`;

export const PanelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`;

export const TeamsUsedTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`;

export const EntryButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`;
