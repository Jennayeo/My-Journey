const getCookie = (name) => {
    let value = "; " + document.cookie;

    let parts = value.split(`; ${name}=`);

    if(parts.length === 2){
        // pop은 원본배열에서 맨뒤 삭제
        return parts.pop().split(";").shift();
    }
}

const setCookie = (name, value, exp = 5) => {
    // exp의 기본값(5)을 미리 넣어줌
    let date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);

    document.cookie = `${name}=${value}; expires=${date.toUTCString()}`;
}

const deleteCookie = (name) => {
    let date = new Date("2019-01-02").toUTCString();
    document.cookie = name+"=; expires="+date;
}

export {getCookie, setCookie, deleteCookie};