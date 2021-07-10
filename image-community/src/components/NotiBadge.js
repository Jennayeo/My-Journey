import React from "react";
import { Badge } from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";

import {realtime} from "../shared/firebase";
import {useSelector} from "react-redux";

const NotiBadge = (props) => {
    // 젤 처음엔 알람이 꺼져있어야하니 true로 설정
    const [is_read, setIsRead] = React.useState(true);
    const user_id = useSelector(state => state.user.user.uid); // 리덕스에있는 user_id가져옴
    // noti뱃지를 누르면 알림 '1'표시가 꺼지도록하는 함수
    const notiCheck = () => {
        props._onClick();
    }

    React.useEffect(() => {
        // 구독할 데이터베이스 // 파이어스토어할땐 collection해서 가져왔지만 여기선 ref
        const notiDB = realtime.ref(`noti/${user_id}`)
        notiDB.update({read: true}); // 읽은 후 알림 꺼주기
        // 리스너 구독
        notiDB.on("value", (snapshot) => {
            console.log(snapshot.val()); // 리얼타임데이터에선 val을 사용해 가져옴

            setIsRead(snapshot.val().read); // badge켰다 껐다
        });

        return () => notiDB.off(); // 구독해제
    }, []);

    return (
        <React.Fragment>
            <Badge color="secondary" variant="dot" invisible={is_read} onClick={notiCheck}>
                <NotificationsIcon/>
            </Badge>

        </React.Fragment>
    )
};

NotiBadge.defaultProps = {
    _onClick: () => {},
}

export default NotiBadge;