import styled from "styled-components";

export const TopWrapper = styled.div`
  display: flex;
  margin: 16px 0px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  .ant-select-prefix {
    height: 16px;
  }
`;

export const ToolOutline = styled.div`
  width: 218px;
  border: 1px solid #dadada;
  border-radius: 8px;
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
  height: 750px;

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
    right: 0;
    bottom: 4px;
    font-size: 10px;
    font-weight: 500;
    color: #797979;
    line-height: 100%;
  }

  .ag-cell {
    padding: 0;
  }

  .sd {
    background: #eeffe5;
  }

  .sc {
    background: #aaff80;
  }
`;
