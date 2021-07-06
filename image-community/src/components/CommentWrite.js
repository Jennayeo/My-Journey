import React from "react";

import {Grid, Input, Button} from "../elements";
import {actionCreators as commentActions} from "../redux/modules/comment";
import {useDispatch, useSelector} from "react-redux";

const CommentWrite = (props) => {
  const dispatch = useDispatch();

    const [comment_text, setCommentText] = React.useState();
    const {post_id} = props;

    const onChange = (e) => {
      setCommentText(e.target.value);
    }

    // comment_text를 리덕스, 파이어스토어에 추가할 함수
    const write = () => {
      console.log(comment_text);
      dispatch(commentActions.addCommentFB(post_id, comment_text));
      setCommentText(""); // 글 작성후 댓글창에선 날려주기
    }

    return (
      <React.Fragment>
        <Grid padding="16px" is_flex>
          <Input 
            placeholder="댓글 내용을 입력해주세요 :)" 
            _onChange={onChange}
            value={comment_text}
            onSubmit = {write} // 엔터키눌러서 작성
            is_submit
            />
          <Button 
            _onClick={write}
            width="50px" 
            margin="0px 2px 0px 2px"
            >작성</Button>
        </Grid>
      </React.Fragment>
    );
}

export default CommentWrite;

