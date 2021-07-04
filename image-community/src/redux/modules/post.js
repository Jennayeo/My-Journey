import {createAction, handleActions} from "redux-actions";
import {produce} from "immer"; // 리듀서 불변성 유지
import { firestore, storage } from "../../shared/firebase";
import moment from "moment";
import {actionCreators as imageActions} from "./image";

const SET_POST = "SET_POST"; // 가져온 목록을 리덕스에 넣어줌
const ADD_POST = "ADD_POST"; // 리덕스에 데이터 하나 더 추가
const EDIT_POST = "EDIT_POST";
const LOADING = "LOADING"; // 무한스크롤, 페이징 가지고오고는지

const setPost = createAction(SET_POST, (post_list, paging) => ({post_list, paging}));
const addPost = createAction(ADD_POST, (post) => ({post}));
const editPost = createAction(EDIT_POST, (post_id, post) => ({post_id, post}));
// 수정하려면 일단 post_id필요하고, 수정할 내용물들도 필요하다(post)
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
    list: [],
    // 무한스크롤을 위한 페이징, is_loading
    paging: {start: null, next: null, size: 3}, // 시작점, 다음 목록, 몇개씩 가져올지
    is_loading: false, // 지금 가지고오고있는 중이니?
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

const editPostFB = (post_id = null, post = {}) => {
    return function (dispatch, getState, {history}){
        if(!post_id){
            return;
        }
        const _image = getState().image.preview;
        const _post_idx = getState().post.list.findIndex(p => p.id === post_id);
        const _post = getState().post.list[_post_idx]; // 게시글 하나의 정보

        const postDB = firestore.collection("post");

        // 새로 이미지를 업로드를 해주지않았다면
        if(_image === _post.image_url){ // 프리뷰와 비교, 같다면 새업로드X
            postDB.doc(post_id).update(post).then(doc => {
                dispatch(editPost(post_id, {...post}))
                history.replace("/");
            });

            return;
        }else {
            const user_id = getState().user.user.uid;
            const _upload = storage
              .ref(`images/${user_id}_${new Date().getTime()}`)
              .putString(_image, "data_url");
      
            _upload.then((snapshot) => {
              snapshot.ref
                .getDownloadURL()
                .then((url) => {
                  console.log(url);
      
                  return url;
                })
                .then((url) => {
                  postDB
                    .doc(post_id)
                    .update({ ...post, image_url: url })
                    .then((doc) => {
                      dispatch(editPost(post_id, { ...post, image_url: url }));
                      history.replace("/");
                    });
                })
                .catch((err) => {
                  window.alert("앗! 이미지 업로드에 문제가 있어요!");
                  console.log("앗! 이미지 업로드에 문제가 있어요!", err);
                });
            });
          }
        };
      };


// FB에 글 추가하는 함수
const addPostFB = (contents) => {
    return function (dispatch, getState, {history}) {
        // 정보들을 컬렉션에 넣기 전 컬렉션 선택
        const postDB = firestore.collection("post");

        // 추가해야할 정보
        const _user = getState().user.user; // getState는 스토어 데이터에 접근 가능하도록
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
        // 이미지 업로드를위해 preview를 가져온다.
        const _image = getState().image.preview; // image는 스토어의 상태값
        console.log(_image);
        console.log(typeof _image);
        const _upload = storage.ref(`images/${user_info.user_id}_${new Date().getTime()}`).putString(_image, "data_url");
        _upload.then(snapshot => {
            snapshot.ref.getDownloadURL().then(url => {
                console.log(url);

                return url; // url을 리턴하고있으니 .then이후 사용가능
            }).then(url => {
                postDB.add({...user_info, ..._post, image_url: url}).then((doc) => {
                    let post = {user_info, ..._post, id: doc.id, image_url: url}; // 리덕스와 파베 데이터 모양새 맞춰주기
                    dispatch(addPost(post));
                    history.replace("/");

                    // 업로드 완료 후 preview이미지 비워주기
                    dispatch(imageActions.setPreview(null));

                }).catch((err) => {
                    window.alert('게시글 업로드에 실패하였어요. 다시 시도해주세요!');
                    console.log("게시글 작성 실패. 다시 시도해주세요!")
                });
            }).catch((err) => {
                window.alert('이미지 업로드에 실패하였어요. 다시 시도해주세요!');
                console.log('이미지 업로드 실패');
            })
                    
                })
    }
}
const getPostFB = (start = null, size = 3) => {
    return function (dispatch, getState, {history}) {

        // 더이상 추가로드할게 없으면
        let _paging = getState().post.paging;
        if(_paging.start && !_paging.next){
            return;
        }

        dispatch(loading(true)); // is_loading을 true바꿔줌
        const postDB = firestore.collection("post");
    
        // 무한스크롤위한 쿼리 가져오기
        let query = postDB.orderBy("insert_dt", "desc"); // 역순정렬
        if(start){ // 스타트 정보가있다면
            query = query.startAt(start);
        }
        query
            .limit(size + 1)
            .get()
            .then(docs => {
            let post_list = [];
            let paging = {
                start: docs.docs[0],
                next: docs.docs.length === size +1? docs.docs[docs.docs.length - 1] : null,
                size: size,
            }
            docs.forEach((doc) => {

                // 데이터 형식 맞춰줌 (파베와 리덕스)
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
        post_list.pop();

        dispatch(setPost(post_list, paging));
        });
        return;
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
            draft.list.push(...action.payload.post_list);
            draft.paging = action.payload.paging;
            draft.is_loading = false; // 다 불러왔음 로딩이 끝난거니 false로 바꿔준다
        }),
        [ADD_POST]: (state, action) => produce(state, (draft) => {
            draft.list.unshift(action.payload.post);
        }),
        [EDIT_POST]: (state, action) => produce(state, (draft) => {
            //id로 뭘 고칠건지 찾아야함
            let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
            draft.list[idx] = {...draft.list[idx], ...action.payload.post};
        }),
        [LOADING]: (state, action) => produce(state, (draft) => {
            draft.is_loading =action.payload.is_loading;
        })
    }, initialState
);

const actionCreators = {
    setPost,
    addPost,
    editPost,
    getPostFB,
    addPostFB,
    editPostFB,
}

export {actionCreators};