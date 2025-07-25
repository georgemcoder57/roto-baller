import styled from "styled-components";

export const AppWrapper = styled.div`
  border: none !important;
  position: relative;
  background: white;

  .ant-table-cell {
    background: white !important;
    border-color: #f0f0f0 !important;
    border-right: none !important;
  }

  .chart-wrapper.line {
    height: 264px;
  }

  .chart-wrapper.bar {
    height: 180px;
  }

  .tables {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 10px;

    @media screen and (max-width: 780px) {
      flex-direction: column;
    }

    .table-panel {
      width: 45%;

      @media screen and (max-width: 780px) {
        width: 100%;
      }

      .table-wrapper {
        width: 100%;
      }

      .table-header {
        width: 100%;
        text-align: center;
        font-size: 24px;
        margin-bottom: 8px;
      }

      .bold-team-name {
        font-weight: bold;
      }
    }
  }

  .mobile-filter-panel {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }

  .ant-card-head-wrapper {
    @media screen and (max-width: 780px) {
      padding-top: 20px;
      display: block;
    }
  }

  .entry-title,
  .entry-name,
  .double-picks-start,
  .teams-used,
  .ant-card-extra,
  .ant-select-selection-item {
    @media screen and (max-width: 480px) {
      font-size: 16px !important;
      line-height: 100% !important;
    }
  }

  .double-picks-start {
    @media screen and (max-width: 480px) {
      margin: 10px 0px 5px 0px;
    }
  }

  .entry-name {
    @media screen and (max-width: 480px) {
      margin-bottom: 5px;
    }
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  margin-top: 16px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 10px;

  @media screen and (max-width: 1160px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media screen and (max-width: 780px) {
    justify-content: space-between;
    flex-direction: row;
    margin: 8px 0px !important;
  }

  .ant-select-selection-item {
    font-size: 16px;
    @media screen and (max-width: 480px) {
      font-size: 16px !important;
      line-height: 100% !important;
    }
  }

  .all-button {
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    height: 44px;
    width: 176px;
    background: white;
    border: 1px solid #d9d9d9;
    border-radius: 32px;
    margin: 0px;

    @media screen and (max-width: 780px) {
      display: flex;
    }

    .all-button-text {
      font-weight: 500;
      font-style: Medium;
      font-size: 16px;
      line-height: 100%;
      letter-spacing: 0%;
      text-align: center;
      width: 100%;

      @media screen and (max-width: 480px) {
        font-size: 16px !important;
        line-height: 100% !important;
      }
    }

    img {
      position: absolute;
      left: 12px;
      top: 12px;
      width: 20px !important;
      height: 20px !important;
    }
  }

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
  flex-wrap: wrap;
  background: white;
  margin-bottom: 30px !important;

  @media screen and (max-width: 780px) {
    margin-bottom: 15px !important;
  }

  .ant-select-prefix {
    height: 16px;
  }
`;

export const Links = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  @media screen and (max-width: 780px) {
    width: 100%;
    padding-bottom: 12px;
  }

  a {
    font-weight: 500;
    font-size: 18px;
    text-decoration: none;
    color: #006dc8;

    @media screen and (max-width: 780px) {
      font-size: 15px !important;
      line-height: 100% !important;
    }
  }
`;

export const ToolOutline = styled.div`
  width: 24%;
  border-radius: 32px;
  border: 1px solid #dadada;
  padding: 12px 16px;
  padding-left: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;

  @media screen and (max-width: 870px) {
    width: 45%;
  }

  @media screen and (max-width: 780px) {
    width: 85%;
  }
`;

export const ToolText = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 100%;
  color: black;

  @media screen and (max-width: 480px) {
    font-size: 16px !important;
    line-height: 100% !important;
  }

  @media screen and (max-width: 1100px) {
    font-size: 14px;
  }
`;

export const AppTitle = styled.div`
  font-weight: 700;
  font-size: 38px;
  line-height: 100%;
  flex-wrap: wrap;

  @media screen and (max-width: 780px) {
    font-size: 25px !important;
    margin-bottom: 15px !important;
  }
`;

export const GridWrapper = styled.div`
  height: 1356px;
  border: 1px solid #ededed;
  border-radius: 8px;
  width: ${(props) => (props.simple ? "370px" : "100%")};
  overflow-x: auto;
  overflow-y: hidden;
  margin: ${(props) => (props.simple ? "auto !important" : "0 !important")};

  .ag-row-hover {
    background-color: transparent !important;
  }

  .ag-row-hover .ag-column-first .team-name {
    background: #3fa2ec;
  }

  .ag-root-wrapper-body {
    margin: 0 !important;

    * {
      margin: 0 !important;
    }
  }

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
    height: 5px;
    background: #30c5ffcc;
    position: absolute;
    top: calc(50% - 2.5px);
  }

  .red-bar {
    width: 5px;
    height: 100%;
    background-color: #30c5ffcc;
    position: absolute;
    left: calc(50% - 2.5px);
  }

  .win-percent,
  .pick-percent {
    position: relative;
    background: white;

    @media screen and (max-width: 480px) {
      font-size: 14px !important;
      line-height: 38px !important;
    }
  }

  .red-bar.hide-red-bar {
    display: none;
  }

  .ag-cell.cell-selected {
    font-weight: bold;
    border: 5px solid #30c5ffcc !important;
    box-sizing: border-box;

    .name-value {
      line-height: 30px;

      @media screen and (max-width: 480px) {
        font-size: 14px !important;
        line-height: 27px !important;
      }
    }
  }

  .cell-disabled {
    pointer-events: none;
    background: white;
    cursor: not-allowed;
  }

  .fake-disabled {
    opacity: 0.4;
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
    box-sizing: border-box;
  }

  .ag-cell-focus:not(.ag-cell-range-selected):focus-within {
    border: 1px solid transparent;
  }

  .ag-header-cell {
    padding: 0 !important;
  }
  .ag-header-cell-label {
    justify-content: center;
  }

  .ag-header-cell-text {
    font-weight: bold;

    @media screen and (max-width: 480px) {
      font-size: 14px !important;
      line-height: 38px !important;
    }
  }

  .team-name {
    background: #006dc8;
    color: white;
    text-align: center;
    font-weight: bold;
    height: 100%;

    @media screen and (max-width: 480px) {
      font-size: 14px !important;
      line-height: 38px !important;
    }
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
    line-height: 35px;
    color: black;
    height: 100% !important;

    @media screen and (max-width: 480px) {
      font-size: 14px !important;
      line-height: 38px !important;
    }
  }

  .point-value {
    position: absolute;
    right: 2px;
    bottom: 2px;
    font-size: 10px;
    font-weight: 500;
    color: #797979;
    line-height: 100%;

    @media screen and (max-width: 480px) {
      font-size: 10px !important;
      line-height: 100% !important;
    }
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
    height: 100%;
  }

  .gray {
    background: lightgray;
    position: relative;
    height: 100%;
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
  flex-wrap: wrap;
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

export const FilterButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex: 1;

  @media screen and (max-width: 870px) {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  @media screen and (max-width: 1160px) {
    margin-bottom: 10px;
  }

  @media screen and (max-width: 780px) {
    display: none;
  }
`;

export const EntryTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;

  @media screen and (max-width: 780px) {
    flex-wrap: wrap;
  }
`;
