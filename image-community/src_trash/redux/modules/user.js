// ducks 구조
import {createAction, handleActions} from "redux-actions"; // 액션과 리듀서를 편하게 만들어줌
import {produce} from "immer";
import {setCookie, getCookie, deleteCookie} from "../../shared/Cookie";

import {auth} from "../../shared/firebase";
import firebase from "firebase/app";

// actions
const LOG_IN = "LOG_IN";
const LOG_OUT = "LOG_OUT";
const GET_USER = "GET_USER";
const SET_USER = "SET_USER"; // 회원가입

// action cerators
    // redux-actions가 없었다면 아래처럼 귀찮게 만들어 줘야함
    // const logIn = (user) => {
    //     return {
    //         type: LOG_IN,
    //         user
    //     }
    // }
const logIn = createAction(LOG_IN, (user) => ({user})); // 액션 타입, 받아온 정보(파라미터)를 넘겨줌
const logOut = createAction(LOG_OUT, (user) => ({user}));
const getUser = createAction(GET_USER, (user) => ({user}));
const setUser = createAction(SET_USER, (user) => ({user}));

// initialState
const initialState ={
    user: null,
    is_login: false,
};

const user_initial = {
    user_name: 'jenna',
};

// middleware actions(페이지 이동)
const loginFB = (id, pwd) => {
    return function (dispatch, getState, {history}) {
        // 어떻게 파이어베이스에 로그인을 할 수있는지 -> 파베 문서를 확인해보면된다.
        auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then((res) => {
                auth
                .signInWithEmailAndPassword(id, pwd)
                .then((user) => {
                    // Signed in
                    // 로그인 후의 동작
                    console.log(user); // id, pwd로 로그인 하기때문에 유저네임을 따로 가져와줘야한다.
                    dispatch(
                        setUser({
                            user_name: user.user.displayName,
                            id: id,
                            user_profile: '',
                            uid: user.user.uid,
                        })
                    );
                    history.push("/");
    
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;

                    console.log(errorCode, errorMessage)
                });
            });
    }
}

const signupFB = (id, pwd, user_name) => {
    return function (dispatch, getState, {history}){
        // 어떤 동작을 할것인지 -> 파베 문서에 있음
        auth
            .createUserWithEmailAndPassword(id, pwd)
            .then((user) => {
                console.log(user);

                // 회원가입 완료 후 프로필 업데이트
                auth.currentUser.updateProfile({
                    // 바꾸고싶은 내용
                    displayName: user_name,
                }).then(() => { // 성공 후 then으로 들어옴
                    dispatch(setUser({user_name: user_name, id: id, user_profile: '', uid: user.user.uid}));
                    history.push('/');
                }).catch((error) => {
                    console.log(error);
                });
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                console.log(errorCode, errorMessage);
            });

    }
}

const loginCheckFB = () => {
    return function (dispatch, getState, {history}){
        auth.onAuthStateChanged((user) => {
            if(user){
                dispatch(setUser({
                    user_name: user.displayName,
                    user_profile: "",
                    id: user.email,
                    uid: user.uid,
                }
                ))
            }else{
                dispatch(logOut());
            }
        })
    }
}

const logoutFB = () => {
    return function (dispatch, getState, {history}) {
        auth.signOut().then(() => {
            dispatch(logOut());
            history.replace('/');
        })
    }
}
// handleActions를 사용해 리듀서를 간단하게 적을 수 있음
// 리듀서 안에서 일어나느 작업을 불변성 유지 해주기 위해 immer사용(produce)
// produce를 쓰면 원본값을(state) 줘야함(복사하기위해)(draft) 그리고 이 값을 가지고 어떤 작업을 하고싶은지도 알려줌
export default handleActions(
    {
        [SET_USER]: (state, action) =>
        produce(state, (draft) => {
            setCookie("is_login", "success");
            draft.user = action.payload.user; // 액션안에 타입, 페이로드가 있는데 이 페이로드에 우리가 넘겨준 데이터가 담김
                    draft.is_login = true;
        }),
            [LOG_OUT]: (state, action) =>
        produce(state, (draft) => {
            deleteCookie("is_login");
            draft.user = null;
                    draft.is_login = false;
        }),
        [GET_USER]: (state, action) => produce(state, (draft) => {}),
    },
    initialState
    );

// action creator export
const actionCreators = {
    logOut,
    getUser,
    signupFB,
    loginFB,
    loginCheckFB,
    logoutFB
};

export {actionCreators};


