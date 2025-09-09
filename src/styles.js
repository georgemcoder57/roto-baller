import styled from "styled-components";

export const AppWrapper = styled.div`
  border: none !important;
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;

  .entry-card {
    width: 100%;
    background: #f7f7f7;
    border: 1px solid #ededed;
    order: 4;

    .ant-card-body {
      padding: 10px 12px;
    }

    @media screen and (max-width: 1100px) {
      .entry-name,
      .double-picks-start,
      .teams-used-title {
        display: none;
      }

      .ant-select-selection-placeholder {
        font-size: 16px !important;
        font-weight: normal !important;
      }
    }
  }

  .upset-table-wrapper
    table:not(.marianExclude)
    tbody
    > tr:first-of-type
    > td.ant-table-cell {
    background: white !important;
    border-color: #f0f0f0 !important;
    border-right: none !important;
    font-size: 16px !important;
  }

  .ant-table-cell {
    font-size: 16px !important;
    background: white !important;
    border-color: #f0f0f0 !important;
    border-right: none !important;
  }

  .chart-wrapper.line {
    height: 400px;
  }

  .chart-wrapper.bar {
    height: 220px;
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
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 18px;
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
    order: 4;

    @media screen and (max-width: 1100px) {
      order: 5;
      width: 100%;
      padding: 0;
      margin-bottom: 12px;

      .line-select .ant-select-prefix {
        height: 20px !important;

        img {
          width: 20px !important;
          height: 20px !important;
        }
      }

      .ant-select-prefix img {
        padding: 0 !important;
      }
    }
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

  .entry-name,
  .double-picks-start {
    margin-bottom: 8px;
  }

  .entry-name,
  .teams-used,
  .double-picks-start {
    font-weight: 700;
    font-style: bold;
    font-size: 16px;
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  margin-top: 12px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  order: 5;

  .line-select .ant-select-selector {
    border-radius: 8px !important;
  }

  .week-select .ant-select-selector {
    border-radius: 8px;
  }

  @media screen and (max-width: 1100px) {
    order: 5;
    flex-direction: column;
    align-items: flex-start;
    margin: 0px;
    padding: 16px 0px;
    width: 100%;

    .ant-select,
    .all-button {
      width: 49% !important;
    }
  }

  @media screen and (max-width: 780px) {
    justify-content: space-between;
    flex-direction: row;
  }

  .ant-select-selector {
    padding: 0 12px !important;
  }

  .ant-select-selection-item {
    font-size: 16px;
    padding-left: 12px !important;
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
    border-radius: 8px;
    margin: 0px;
    box-sizing: border-box;

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
  margin-bottom: 28px !important;
  order: 1;

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
  border-radius: 8px;
  border: 1px solid #dadada;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;

  @media screen and (max-width: 1100px) {
    width: calc(100% - 32px);
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

export const AppTitle = styled.h2`
  flex-wrap: wrap;
  margin: 0 !important;

  @media screen and (max-width: 780px) {
    font-size: 25px !important;
    /* margin-bottom: 15px !important; */
  }
`;

export const GridWrapper = styled.div`
  height: 1356px;
  border: 1px solid #ededed;
  border-radius: 8px;
  width: ${(props) => (props.simple ? "370px" : "100%")};
  overflow-x: auto;
  overflow-y: hidden;
  order: 6;
  position: relative;
  margin: ${(props) => (props.simple ? "auto !important" : "0 !important")};

  & > div:first-child {
    border: none !important;
  }

  .ag-header-cell-comp-wrapper {
    background: #f7f7f7;
  }

  .ag-theme-params-3 {
    border: none !important;
  }

  .loading-wrapper {
    position: absolute;
    left: 0;
    background: lightgray;
    width: 100%;
    height: 100%;
    z-index: 1111;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
  }
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
    height: 4px;
    background: #30c5ff99;
    position: absolute;
    top: calc(50% - 2.5px);
  }

  .red-bar-underline {
    width: 100%;
    height: 3px;
    background: #30c5ffcc;
    position: absolute;
    bottom: 0px;
    left: 0px;
  }

  .win {
    color: #80ff80;
  }

  .lost {
    color: #ff8080;
  }

  .red-bar {
    width: 4px;
    height: 100%;
    background-color: #30c5ff99;
    position: absolute;
    left: calc(50% - 2.5px);
  }

  .stats-values * {
    font-size: 10px !important;
    font-weight: 500 !important;
    line-height: 100% !important;
  }

  .stats-values {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .stats-values-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 5px;
      padding-left: 5px;
      padding-right: 5px;
    }

    .stats-values-bottom {
      text-align: center;
      padding-bottom: 5px;
      padding-left: 5px;
      padding-right: 5px;
    }
  }

  .win-percent,
  .pick-percent,
  .fv-value,
  .stats-values {
    position: relative;
    background: #ffffc2;
    max-height: 29px;
  }

  .win-percent,
  .pick-percent {
    @media screen and (max-width: 480px) {
      font-size: 13px !important;
      line-height: inherit !important;
    }
  }

  .red-bar.hide-red-bar {
    display: none;
  }

  .ag-cell.cell-selected {
    font-weight: bold;
    border: 3px solid #30c5ffcc !important;
    box-sizing: border-box;

    .name-value {
      line-height: 21px !important;

      @media screen and (max-width: 480px) {
        font-size: 13px !important;
        line-height: 19px !important;
      }
    }
  }

  .cell-disabled {
    pointer-events: none;
    background: white;
    cursor: not-allowed;
  }

  .fake-disabled.cell-disabled {
    pointer-events: all;
    cursor: inherit;
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

  .selected-column .ag-header-cell-label {
    border-bottom: 3px solid #006dc8;
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

    &.cell-selected {
      color: #fdfd02;
    }

    @media screen and (max-width: 480px) {
      font-size: 13px !important;
      line-height: inherit !important;
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
    margin-right: 5px !important;
  }

  .name-value,
  .fv-value {
    font-size: 13px;
    font-weight: 500;
    line-height: inherit;
    color: black;
    height: 100% !important;

    @media screen and (max-width: 480px) {
      font-size: 13px !important;
      line-height: inherit !important;
    }
  }

  .point-value {
    position: absolute;
    right: 2px;
    bottom: 2px;
    font-size: 8px;
    font-weight: 500;
    color: #797979;
    line-height: 100%;

    @media screen and (max-width: 480px) {
      font-size: 8px !important;
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
    color: #d7d6d6;
  }

  .gray .point-value {
    color: #d7d6d6;
  }

  .cell-disabled .name-value,
  .cell-disabled .point-value {
    color: #d7d6d6;
  }

  .cell-disabled.fake-disabled .name-value,
  .cell-disabled.fake-disabled .point-value {
    color: black;
  }

  .cell-disabled.fake-disabled .gray .name-value,
  .cell-disabled.fake-disabled .gray .point-value {
    color: #d7d6d6;
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

export const PanelTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;

  .panel-top-left {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;

    .entry-wrapper {
      flex: 1;
    }
  }

  @media screen and (max-width: 1100px) {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px !important;

    .panel-top-left {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;

      .entry-wrapper {
        width: 100%;

        input {
          font-size: 16px !important;
        }
      }
    }

    .panel-top-right {
      width: 100%;

      .ant-select {
        width: 100% !important;
      }
    }
  }
`;

export const PanelBottom = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  .ant-select-selection-wrap {
    height: 100%;
  }

  .teams-used {
    width: 100%;

    .ant-select-selector {
      min-height: 43px;
    }

    .ant-select-selection-overflow {
      min-height: 43px;
    }

    .ant-select-selection-item-content {
      line-height: 19px !important;
    }
  }

  .panel-top-left {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;

    .entry-wrapper {
      flex: 1;
    }
  }

  .double-picks-start-panel {
    margin: 0 !important;
  }

  @media screen and (max-width: 1100px) {
    flex-direction: column-reverse;
    gap: 20px;

    .double-picks-start-panel {
      width: 100%;

      .ant-select {
        width: 100% !important;
      }
    }

    .teams-used {
      width: 100%;

      .ant-select-selection-overflow-item {
        margin: 0 !important;
      }

      .ant-select {
        width: 100% !important;
        height: auto !important;

        .ant-select-selector {
          height: 100%;
          min-height: 43px;
        }
      }
    }
  }
`;

export const PanelWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

export const TeamsUsedTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  margin-bottom: 8px;

  .show-switch {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
  }

  .show-title {
    font-size: 14px !important;
    font-weight: 590 !important;
    font-style: medium;
  }
`;

export const EntryButtons = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 10px;

  .save-btn,
  .clear-btn {
    width: 200px;
    height: 43px;
  }

  .remove-btn img {
    padding: 0 !important;
  }

  @media screen and (max-width: 1100px) {
    width: 100%;

    .save-btn,
    .clear-btn {
      width: calc(50% - 24px);
    }
  }
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
