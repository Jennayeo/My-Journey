// PostList.js

import React from "react";

import Post from "../components/Post";
import {useSelector, useDispatch} from "react-redux";
import {actionCreators as postActions} from "../redux/modules/post";
// import { is } from "immer/dist/internal";


const PostList = (props) => {
    const dispatch = useDispatch();
    const post_list = useSelector((state) => state.post.list);

    console.log(post_list);

    React.useEffect(() => {
        // 추가한 게시글 제일 위로 올려주기
        if(post_list.length === 0){
            dispatch(postActions.getPostFB());
        }
    }, []);

    return (
        <React.Fragment>
            {post_list.map((p, idx) => {

                return <Post key={p.id} {...p}/>
                // post하나를 p라고 해주고, 갯수만큼 불러올테니 idx
                // 스프레드 문법사용해 게시글 모든 정보를 불러와준다.
                // map사용시 key를 써줘야한다.
            })}
        </React.Fragment>
    )
}

export default PostList;