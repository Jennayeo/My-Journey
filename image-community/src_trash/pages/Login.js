import React from "react";
import { Text, Input, Grid, Button } from "../elements";
import {getCookie, setCookie, deleteCookie} from "../shared/Cookie";
import styled from "styled-components";

import {useDispatch} from "react-redux";
import {actionCreators as userActions} from "../redux/modules/user"
import { emailCheck } from "../shared/Common";

const Login = (props) => {

  const dispatch = useDispatch();

  //로그인 시 받아오는 id, pwd를 가져온다.
  const [id, setId] = React.useState("");
  const [pwd, setPwd] = React.useState("");

  const login = () => {

    // 로그인 시 빈값은 막자
    if(id === "" || pwd === "") {
      window.alert("아이디 혹은 비밀번호를 입력해주세요!")
      return;
    }

    if(!emailCheck(id)){
      window.alert("이메일 형식이 맞지않습니다!");
      return;
    }
    // 만료일 3일
    // setCookie("user_id", "jenna", 3);
    // setCookie("user_pwd", "12345", 3);
    dispatch(userActions.loginFB(id, pwd));
  };

  return (
    <React.Fragment>
      <Grid padding="16px">
        <Text size="32px" bold>
          로그인
        </Text>

        <Grid padding="16px 0px">
          <Input
            label="아이디"
            placeholder="아이디를 입력해주세요."
            _onChange={(e) => {
              setId(e.target.value);
            }}
          />
        </Grid>

        <Grid padding="16px 0px">
          <Input
            label="패스워드"
            placeholder="패스워드 입력해주세요."
            type="password"
            _onChange={(e) => {
              setPwd(e.target.value);
            }}
          />
        </Grid>

        <Button
          text="로그인하기"
          _onClick={() => {
            console.log("로그인 했어!");
            // deleteCookie("user_id");
            login();
          }}
        ></Button>
      </Grid>
    </React.Fragment>
  );
};


export default Login;