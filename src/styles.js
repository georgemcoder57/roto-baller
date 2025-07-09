import styled from "styled-components";

export const AppWrapper = styled.div`
  border: none !important;
  position: relative;

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
  margin: 16px 0px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  @media screen and (max-width: 780px) {
    justify-content: center;
  }

  .ant-select-selection-item {
    @media screen and (max-width: 480px) {
      font-size: 16px !important;
      line-height: 100% !important;
    }
  }

  .all-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 44px;
    width: 176px;
    background: white;
    border: 1px solid #d9d9d9;
    border-radius: 32px;

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
`;

export const AppTitle = styled.div`
  font-weight: 700;
  font-size: 38px;
  line-height: 100%;
  flex-wrap: wrap;

  @media screen and (max-width: 780px) {
    font-size: 30px !important;
    margin-bottom: 15px !important;
  }
`;

export const GridWrapper = styled.div`
  height: 1365px;
  width: 100%;
  overflow-x: auto;
  margin: 0 !important;

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

export const FilterModal = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 5;
  background: #f8f8f8;
  overflow: hidden;

  .top-section {
    display: flex;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .go-back-btn {
      position: absolute;
      left: 20px;
      top: 20px;
      width: 20px;
      height: 20px;
    }

    .top-section-text {
      text-align: center;
      width: 100%;
      font-weight: 400;
      font-style: Regular;
      font-size: 24px;
      line-height: 100%;
      letter-spacing: 0%;

      @media screen and (max-width: 480px) {
        font-size: 24px !important;
        line-height: 100% !important;
      }
    }
  }

  .all-settings-content {
    padding: 16px;

    .mobile-setting-wrapper {
      width: calc(100% - 32px);
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
    }
  }
`;
