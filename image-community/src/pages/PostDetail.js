import React from "react";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import CommentWrite from "../components/CommentWrite";
import {useSelector} from "react-redux";
import {firestore} from "../shared/firebase";

const PostDetail = (props) => {
    const id = props.match.params.id;
    const user_info = useSelector((state) => state.user.user);

    console.log(id);
    const post_list = useSelector(store => store.post.list);
    const post_idx = post_list.findIndex(p => p.id === id);
    const post_data = post_list[post_idx];

    const [post, setPost] = React.useState(post_data? post_data: null);

    // 데이터를 리덕스에서아닌 파이어스토어에서 가져오기
    React.useEffect(() => {
        if(post) {
            return;
        }
        const postDB = firestore.collection("post");
        postDB.doc(id).get().then(doc => {
            console.log(doc);
            console.log(doc.data());

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
                }, {id: doc.id, user_info: {}});
            setPost(post);
        })
    })
    console.log(post);
    return (
        <React.Fragment>
            {/* post가있을때에만 */}
            {post && <Post {...post} is_me={post.user_info.user_id === user_info.uid}/>}
            <CommentWrite/>
            <CommentList/>
        </React.Fragment>
    )
}

export default PostDetail;