import {createAction, handleActions} from "redux-actions";
import {produce} from "immer"; // 리듀서 불변성 유지
import { firestore } from "../../shared/firebase";
import moment from "moment";

const SET_POST = "SET_POST"; // 가져온 목록을 리덕스에 넣어줌
const ADD_POST = "ADD_POST"; // 리덕스에 데이터 하나 더 추가

const setPost = createAction(SET_POST, (post_list) => ({post_list}));
const addPost = createAction(ADD_POST, (post) => ({post}));

const initialState = {
    list: [],
}

const initialPost = {
    // id: 0, // 자동 id가져올테니 주석처리
    // user_info: {
    //     user_name: "Jenna",
    //     user_profile: "https://bomi.s3.ap-northeast-2.amazonaws.com/IMG_6564.JPG",
    // }, //  유저 리덕스에 들어가있는 값을 가져올테니 주석처리
    image_url: "https://bomi.s3.ap-northeast-2.amazonaws.com/IMG_6564.JPG",
    contents: "",
    comment_cnt: 0,
    insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    // insert_dt: "2021-02-27 10:00:00",
};

// FB에 글 추가하는 함수
const addPostFB = (contents) => {
    return function (dispatch, getState, {history}) {
        // 정보들을 컬렉션에 넣기 전 컬렉션 선택
        const postDB = firestore.collection("post");

        // 추가해야할 정보
        const _user = getState().user.user;
        console.log(_user);
        const user_info = {
            user_name: _user.user_name,
            user_id: _user.uid,
            user_profile: _user.user_profile
        };
        const _post = {
            ...initialPost,
            contents: contents,
            // addPostFB가 실행 된 후 insert.dt가 만들어질테니 여기서 한번 더 해줘야함
            insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
        };
        postDB.add({...user_info, ..._post}).then((doc) => {
            let post = {user_info, ..._post, id: doc.id}; // 리덕스와 파베 데이터 모양새 맞춰주기
            dispatch(addPost(post));
			history.replace("/");
        }).catch((err) => {
            console.log("게시글 작성 실패. 다시 시도해주세요!")
        });
    }
}
const getPostFB = () => {
    return function (dispatch, getState, {history}) {
        const postDB = firestore.collection("post");

        postDB.get().then((docs) => {
            let post_list = [];
            docs.forEach((doc) => {

                // 데이터 형식 맞춰줌
                let _post = doc.data(); // 파이어스토어에서 가져온 값들을 _post에 넣어줌
                let post = Object.keys(_post).reduce((acc, cur) => { // 딕셔너리의 키값들을 배열로 만들어준다
                // Object.keys(_post) _post의 키 값들을 배열로 만들어줌 -> ['comment_cnt', 'contents', ..]
                // 배열이되었으니 내장함수 사용가능
                // reduce함수는 누산: 첫번째인자(acc) = 누산된 값, 두번째 인자(cur) = 현재값, map처럼 하나하나 돌면서 들어감
                    if(cur.indexOf("user_") !== -1){ // 키값에 user_가 포함되면(=-1이 아니라면)
                        return {...acc, user_info: {...acc.user_info, [cur]: _post[cur]}};
                    } // cur에 키값 하나하나씩 들어감, ...acc: 마지막으로 연산된까지의 딕셔너리가 그대로 들어감
                    // user_info는 따로 묶어줌
                    return {...acc, [cur]: _post[cur]}
                }, {id: doc.id, user_info: {}}); // doc.data에 id안들어가있으니 기본값으로 넣어줌, user_info 기본값으로 미리 넣어줌
                post_list.push(post);
            }
        )
        console.log(post_list);

        dispatch(setPost(post_list))
        })
    }
}
export default handleActions(
    {
        [SET_POST]: (state, action) => produce(state, (draft) => {
            draft.list = action.payload.post_list;
        }),
        [ADD_POST]: (state, action) => produce(state, (draft) => {
            draft.list.unshift(action.payload.post);
        })
    }, initialState
);

const actionCreators = {
    setPost,
    addPost,
    getPostFB,
    addPostFB
}

export {actionCreators};