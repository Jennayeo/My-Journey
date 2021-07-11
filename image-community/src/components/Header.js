import React from "react";
import { Grid, Text, Button } from "../elements";
import { getCookie, deleteCookie } from "../shared/Cookie";

import { useSelector, useDispatch } from "react-redux";
import { actionCreators as userActions } from "../redux/modules/user";

import { history } from "../redux/configureStore";
import { apiKey } from "../shared/firebase";

import NotiBadge from "./NotiBadge";
import user from "../shared/Icon/user.png";
import logout from "../shared/Icon/logout.png";
import styled from "styled-components";
import login from "../shared/Icon/enter.png";
import join from "../shared/Icon/join.png";

const Header = (props) => {
  const dispatch = useDispatch();
  const is_login = useSelector((state) => state.user.is_login);

  const _session_key = `firebase:authUser:${apiKey}:[DEFAULT]`;

  const is_session = sessionStorage.getItem(_session_key)? true : false;
  
  console.log(is_session);

  if (is_login && is_session) {
    return (
      <React.Fragment>
        <Grid is_flex padding="20px 60px">
          <Grid>
            <Text font="KaushanScript" color="#FEC503" margin="0px" size="24px" bold>
            My Journey
            </Text>
          </Grid>

          <Grid width="80%" is_flex>
            <Image src={user}></Image>
            {/* <Button text="알림" _onClick={() => {
              history.push('/noti');
            }}></Button> */}
            {/* NotiBadge _onClick이 props로 넘어오기때문에 NotiBadge에서 defaultprops설정해줌 */}
            <NotiBadge _onClick={() => {
              history.push('/noti');
            }}/> 
            <Image
            src={logout}
              onClick={() => {
                dispatch(userActions.logoutFB());
              }}
            ></Image>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
        <Grid is_flex padding="20px 60px">
        <Grid>
        <Text margin="0px" size="24px" bold>
            My Journey
            </Text>
        </Grid>

        <Grid width="20%" is_flex>
        <Button
            width="80px"
            text="Login"
            _onClick={() => {
              history.push("/login");
            }}
          ></Button>
          <Button
            width="80px"
            text="Join"
            _onClick={() => {
              history.push("/signup");
            }}
          ></Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

Header.defaultProps = {};

const Image = styled.img`
  width: 25px;
`;


export default Header;