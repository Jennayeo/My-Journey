import React from "react";
// import Grid from "../elements/Grid";
// import Image from "../elements/Image";
// import Text from "../elements/Text";

import {Grid, Image, Text, Button} from "../elements";
import {history} from "../redux/configureStore";
import edit from "../shared/Icon/edit.png";
import styled from "styled-components";

const Post = (props) => {
  const id = props.id;

    return (
      <React.Fragment>
        <Grid radius="5px" border="solid" margin_bottom="10px">
          <Grid is_flex padding="10px" border_bottom>
            <Grid is_flex width="auto">
              <Image shape="circle" src={props.user_info.user_profile} />
              <Text bold>{props.user_info.user_name}</Text>
            </Grid>
            <Grid is_flex width="auto">
              <Text margin="15px">{props.insert_dt.split(" ")[0]}</Text>
              {props.is_me && <Edit src={edit} padding="4px" onClick={() => {history.push(`/write/${id}`)}} />}
            </Grid>
          </Grid>
          <Grid padding="16px">
            <Text>{props.contents}</Text>
          </Grid>
          <Grid>
            <Image shape="rectangle" src={props.image_url} />
          </Grid>
          <Grid padding="26px">
            <Text margin="0px" bold>댓글 {props.comment_cnt}개</Text>
          </Grid>
        </Grid>
      </React.Fragment>
    );
}
Post.defaultProps = {
  user_info: {
    user_name: "mean0",
    user_profile: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  },
  image_url: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  contents: "고양이네요!",
  comment_cnt: 10,
  insert_dt: "2021-02-27 10:00:00",
  is_me: false,
};

const Edit = styled.img`
  width: 25px;
`;

export default Post;