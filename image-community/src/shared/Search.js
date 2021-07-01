import React from "react";
import _ from "lodash";

const Search = () => {

    const onChange = (e) => {
        console.log(e.target.value);
    }

    const debounce = _.debounce((e) => {console.log(e.target.value);}, 1000);
    // 1초동안 기다릴테니 1000m/s로 넣어주었다.

    const throttle = _.throttle((e) => {
        console.log(e.target.value);}, 1000);
    

    return (
        <div>
            <input type="text" onChange={throttle}/>
        </div>
    )
}


export default Search;