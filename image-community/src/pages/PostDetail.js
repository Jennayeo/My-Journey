import React from "react";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import CommentWrite from "../components/CommentWrite";
import {useSelector, useDispatch} from "react-redux";

import {actionCreators as postActions} from "../redux/modules/post";
import Permit from "../shared/Permit";

const PostDetail = (props) => {
    const dispatch = useDispatch();

    const id = props.match.params.id;
    const user_info = useSelector((state) => state.user.user);

    console.log(id);
    const post_list = useSelector(store => store.post.list);
    const post_idx = post_list.findIndex(p => p.id === id);
    const post = post_list[post_idx];

    // const [post, setPost] = React.useState(post_data? post_data: null);

    // 데이터를 리덕스에서아닌 파이어스토어에서 가져오기
    React.useEffect(() => {
        if(post) {
            return;
        }
        dispatch(postActions.getOnePostFB(id));

    })
    console.log(post);
    return (
        <React.Fragment>
            {/* post가있을때에만 */}
            {post && <Post {...post} is_me={post.user_info.user_id === user_info?.uid}/>}
            <Permit>
                <CommentWrite post_id={id}/>
            </Permit>
            <CommentList post_id={id}/>
        </React.Fragment>
    )
}

export default PostDetail;