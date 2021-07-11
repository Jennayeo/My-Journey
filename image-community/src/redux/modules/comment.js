import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, realtime } from "../../shared/firebase";
import "moment";
import moment from "moment";

import firebase from "firebase/app";
import {actionCreators as postActions} from "./post";

const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT";

const LOADING = "LOADING";

const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({post_id, comment_list}));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({post_id, comment}));
// const setLike = createAction(SET_LIKE, (post_id) => ({post_id}));
// const addLike = createAction(ADD_LIKE, (post_id) => ({post_id}));

const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: {},
  is_loading: false,
};

const addCommentFB = (post_id, contents) => {
  return function (dispatch, getState, { history }) {
    const commentDB = firestore.collection("comment");
    const user_info = getState().user.user; // 이댓글 작성자의 정보 필요

    // 댓글 데이터
    let comment = {
      post_id: post_id,
      user_id: user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    }

    commentDB.add(comment).then((doc) => {
      const postDB = firestore.collection("post");
      
      // 게시글 들어갔을때 댓글 갯수(리덕스 댓글 데이터 + 1)
      const post = getState().post.list.find(l => l.id === post_id);

      // 댓글을 작성하면 게시글 정보에 있는 댓글 갯수도 +1 해줘야한다. increment는 파베 제공: 파베 import필요
      const increment = firebase.firestore.FieldValue.increment(1);
      // let a = 5; a = a + 1; 즉, comment_cnt + 1
      
      comment = {...comment, id: doc.id};

      // post에도 comment_cnt를 하나 플러스 해줍니다.
      postDB
        .doc(post_id)
        .update({ comment_cnt: increment })
        .then((_post) => {
          // comment를 추가해주고,
          dispatch(addComment(post_id, comment));

          // 리덕스에 post가 있을 때만 post의 comment_cnt를 +1해줍니다.
          if (post) {
            dispatch(
              postActions.editPost(post_id, {
                comment_cnt: parseInt(post.comment_cnt) + 1,
              })
            );

            // 알림 리스트에 하나를 추가해줍니다!
            const _noti_item = realtime
              .ref(`noti/${post.user_info.user_id}/list`)
              .push();

            _noti_item.set({
              post_id: post.id,
              user_name: comment.user_name,
              image_url: post.image_url,
              insert_dt: comment.insert_dt
            }, (err) => {
                if(err){
                    console.log('알림 저장 실패');
                }else{
                  // 알림이 가게 해줍니다!
                  const notiDB = realtime.ref(`noti/${post.user_info.user_id}`);
                  // 읽음 상태를 false로 바꿔주면 되겠죠!
                  notiDB.update({ read: false });
                }
            });
          }
        });
    });
  };
};

// const addCommentFB = (post_id, contents) => { // contents = comment text
//   return function(dispatch, getState, {history}){
//     const commentDB = firestore.collection("comment");
//     const user_info = getState().user.user; // 이댓글 작성자의 정보 필요

//     // 댓글 데이터
//     let comment = {
//       post_id: post_id,
//       user_id: user_info.uid,
//       user_name: user_info.user_name,
//       user_profile: user_info.user_profile,
//       contents: contents,
//       insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
//     }

//     commentDB.add(comment).then((doc) => {
//       const postDB = firestore.collection("post");
      
//       // 게시글 들어갔을때 댓글 갯수(리덕스 댓글 데이터 + 1)
//       const post = getState().post.list.find(l => l.id === post_id);

//       // 댓글을 작성하면 게시글 정보에 있는 댓글 갯수도 +1 해줘야한다. increment는 파베 제공: 파베 import필요
//       const increment = firebase.firestore.FieldValue.increment(1);
//       // let a = 5; a = a + 1; 즉, comment_cnt + 1
      
//       comment = {...comment, id: doc.id};
//       postDB
//         .doc(post_id)
//         .update({comment_cnt: increment})
//         .then((_post) => {
//           dispatch(addComment(post_id, comment));
          
//           //post 하나에대한 댓글 갯수 수정 
//           if (post) {
//             dispatch(
//               postActions.editPost(post_id, {
//                 comment_cnt: parseInt(post.comment_cnt) + 1,
//                 // comment_cnt가 숫자인지 문자인지 확실하지않아서 parseInt사용해서 묵시적 형변 방지
//               }))
//           }
//           // 댓글 작성 후 알림 켜주기
//           const _noti_item = realtime.ref(`noti/${post.user_info.user_id}/list`).push;
//           // 리스트에 알림내역 저장
//           // notiDB.update({read: false});
//           _noti_item.set({ // set을 사용하여 데이터를 넣어준다.
//             post_id: post.id,
//             user_name: comment.user_name,
//             image_url: post.image_url,
//             insert_dt: comment.insert_dt,
//           }, (err) => {
//             if(err){
//               console.log("알림 저장에 실패했어요!");
//             } else{
//               const notiDB = realtime.ref(`noti/${post.user_info.user_id}`);

//               notiDB.update({read: false});
//             }
//   });


const getCommentFB = (post_id = null) => {
    return function(dispatch, getState, {history}){
      const commentDB = firestore.collection("comment");
      if(!post_id){
        return;
      }
      commentDB
        .where("post_id", "==", post_id) // 쿼리 날리기
        .orderBy("insert_dt", "desc")
        .get()
        .then((docs)=>{
          let list = [];
          docs.forEach((doc) => {
            list.push({...doc.data(), id: doc.id});
          });
            dispatch(setComment(post_id, list)); // 리스트가 만들어지면 dispatch해서 넣어줌
          }).catch(err => {
            console.log('댓글 정보를 가져 올 수없습니다.', err);
          });
        }};

export default handleActions(
  {
      [SET_COMMENT]: (state, action) => produce(state, (draft) => {
        // 댓글이 들어갈 방(딕셔너리)생성
        draft.list[action.payload.post_id] = action.payload.comment_list;
      }),
      [ADD_COMMENT]: (state, action) => produce(state, (draft)=> {
        draft.list[action.payload.post_id].unshift(action.payload.comment);
        // 댓글 최신순으로 하려면 push대신 unshift사용
      }),
      [LOADING]: (state, action) => 
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      })
  },
  initialState
);

const actionCreators = {
  getCommentFB,
  addCommentFB,
  setComment,
  addComment,

};

export { actionCreators };