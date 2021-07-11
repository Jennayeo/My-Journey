import React from "react";
import styled from "styled-components";

const Grid = (props) => {
  const { is_flex, width, margin,margin_bottom, padding, bg, children, center, _onClick, radius,border,border_bottom } = props;
  const styles = {
      is_flex: is_flex,
      width: width,
      margin: margin,
      margin_bottom: margin_bottom,
      padding: padding,
      bg: bg,
      center: center,
      radius: radius,
      border: border,
      border_bottom: border_bottom
  };
  return (
    <React.Fragment>
      <GridBox {...styles} onClick={_onClick}>{children}</GridBox>
    </React.Fragment>
  );
};

// Grid 기본값
Grid.defaultProps = {
  chidren: null,
  is_flex: false,
  width: "100%",
  padding: false,
  margin: false,
  bg: false,
  center: false,
  _onClick: () => {},
};

const GridBox = styled.div`
  width: ${(props) => props.width}; // props로 넘어오는 값을 넓이로 지정
  height: 100%;
  box-sizing: border-box; // 전체넓이에 선굵기까지 모두 포함한다
  border-radius: ${(props) => props.radius};
  // 없다면 속성을 안준다
  ${(props) => (props.padding ? `padding: ${props.padding};` : "")}
  ${(props) => (props.margin ? `margin: ${props.margin};` : "")}
  ${(props) => (props.margin_bottom ? `margin-bottom: ${props.margin_bottom};` : "")}
  ${(props) => (props.bg ? `background-color: ${props.bg};` : "")}
  ${(props) =>
    props.is_flex
      ? `display: flex; align-items: center; justify-content: space-between; `
      : ""}
  ${(props) => props.center? `text-align: center`: ""}
  ${(props) => props.border? `border: solid 1px`: ""}
  ${(props) => props.border_bottom? `border-bottom: solid 1px`: ""}
`;

export default Grid;