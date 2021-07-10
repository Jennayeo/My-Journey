import React from "react";
import {Grid, Text} from "../elements";
import Card from "../components/Card";

import {realtime} from "../shared/firebase";
import {useSelector} from "react-redux";

const Notification = (props) => {
  const user = useSelector(state => state.user.user);  // user 리덕스안에 user정보 가져온다.
  const [noti, setNoti] = React.useState([]);

  React.useEffect(() => {
    if(!user){
      return;
    }
    const notiDB = realtime.ref(`noti/${user.uid}/list`);
    const _noti = notiDB.orderByChild("insert_dt"); // realtimeDB는 오름차순만 지원, 일단 데이터를 가져와서 js로 내림차순 정렬
    _noti.once("value", snapshot => {
      if(snapshot.exists()){
        let _data = snapshot.val();
        console.log(_data);
        let _noti_list = Object.keys(_data).reverse().map(s => {
          return _data[s];
        }) // 배열의 내장함수 reverse
        setNoti(_noti_list);
      }
    })
  }, [user]);
    // let noti = [
    //   { user_name: "mean0", post_id: "post1" },
    //   { user_name: "mean0", post_id: "post2" },
    //   { user_name: "mean0", post_id: "post3" },
    //   { user_name: "mean0", post_id: "post4" },
    // ];

    return (
      <React.Fragment>
        <Grid padding="16px" bg="#EFF6FF">
          {noti.map((n, idx) => {
            return <Card key={`noti_${idx}`} {...n} />;
          })}
        </Grid>
      </React.Fragment>
    );
}

export default Notification;