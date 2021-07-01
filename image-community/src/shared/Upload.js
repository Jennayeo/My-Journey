import React from "react";
import {Button} from "../elements";
import {storage} from "./firebase";
import {useSelector, useDispatch} from "react-redux";
import {actionCreators as imageActions} from "../redux/modules/image";

const Upload = (props) => {
    const dispatch = useDispatch();
    const fileInput = React.useRef();
    // 업로딩 중에는 파일 선택 막아주기
    const is_uploading = useSelector(state => state.image.uploading);
    const selectFile = (e) => {
        console.log(e);
        console.log(e.target); // input 자체
        console.log(e.target.files[0]); // 파일리스트

        console.log(fileInput.current.files[0]);


        // preview
        const reader = new FileReader(); // 파일리더 객체
        const file = fileInput.current.files[0]; // 이 객체를 파일이라는 변수에 넣었음

        reader.readAsDataURL(file);
        reader.onloadend = () => {
            console.log(reader.result);
            dispatch(imageActions.setPreview(reader.result));
        }
    }

    const uploadFB = () => {
        let image = fileInput.current.files[0];
        const _upload = storage.ref(`images/${image.name}`).put(image);
        _upload.then((snapshot) => {
            console.log(snapshot);

            snapshot.ref.getDownloadURL().then((url) => {
                console.log(url);
            })
        })

    }
    return (
        <React.Fragment>
            <input type="file" onChange={selectFile} ref={fileInput} disabled={is_uploading}/>
            <Button _onClick={uploadFB}>업로드하기</Button>
        </React.Fragment>
    )
}

export default Upload;