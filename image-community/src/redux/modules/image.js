import {createAction, handleActions} from "redux-actions";
import produce from "immer";

import {storage} from "../../shared/firebase";

const UPLOADING = "UPLOADING"; // 업로드 중인지 아닌지 구분 액션
const UPLOAD_IMAGE = "UPLOAD_IMAGE"; // 실제로 파일 업로드 액션
const SET_PREVIEW = "SET_PREVIEW";

const uploading = createAction(UPLOADING, (uploading) => ({uploading}));
const uploadImage = createAction(UPLOAD_IMAGE, (image_url) => ({image_url}));
const setPreview = createAction(SET_PREVIEW, (preview) => ({preview}));

const initialState = {
    image_url: '',
    uploading: false,
    preview: null,
}

const uploadImageFB = (image) => {
    return function(dispatch, getState, {history}){

        dispatch(uploading(true)); // 이미지 업로드 중에 재업로드를 방지한다.

        const _upload = storage.ref(`images/${image.name}`).put(image);
        _upload.then((snapshot) => {
            console.log(snapshot);
            // dispatch(uploading(false));
            snapshot.ref.getDownloadURL().then((url) => {
                dispatch(uploadImage(url));
                console.log(url);
            })
        })
    }
}
export default handleActions({
    [UPLOAD_IMAGE]: (state, action) => produce(state, (draft) => {
        draft.image_url = action.payload.image_url;
        draft.uploading = false; // url이 가져와졌을땐 이미 업로드가 끝난것이니 바로 uploading false로 해준다.
    }),
    [UPLOADING]: (state, action) => produce(state, (draft) => {
        draft.uploading = action.payload.uploading;
    }),
    [SET_PREVIEW]: (state, action) => produce(state, (draft) => {
        draft.preview = action.payload.preview;
    })
}, initialState);

const actionCreators = {
    uploadImage,
    uploadImageFB,
    setPreview
}

export {actionCreators};