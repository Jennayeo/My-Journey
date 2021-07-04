import React from 'react'
import _ from "lodash";
import {Spinner} from "../elements";

const InfinityScroll = (props) => {
    const {children, callNext, is_next, loading} = props;

    
    const _handleScroll = _.throttle(() => {
        if(loading){
            return;
        }

        // 스크롤 계산
        const {innerHeight} = window; // 브라우저 창 높이
        const {scrollHeight} = document.body;

        const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrorllTop;
        // document아래에 documentElement가 있다면 scrollTop을 가져와라, 없다면 body에서 스크롤탑을 가져와라

        if(scrollHeight -innerHeight - scrollTop < 200) {
            
            callNext();
        }
    }, 300); // 300ms에 한번만 실행

    const handleScroll = React.useCallback(_handleScroll, [loading]);
    React.useEffect(() => {
        if(loading){
            return;
        }

        // 스크롤 이벤트
        if(is_next) {
            window.addEventListener("scroll", handleScroll);
        }else{
            window.removeEventListener("scroll", handleScroll);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, [is_next, loading]);

    return (
        <React.Fragment>
            {props.children}
            {is_next && (<Spinner/>)}
        </React.Fragment>
    )
}

InfinityScroll.defaultProps = {
    children: null,
    callNext: () => {},
    is_next: false,
    loading: false,
}

export default InfinityScroll
