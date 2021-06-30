import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { createBrowserHistory } from "history";
import { connectRouter } from "connected-react-router";

import User from "./modules/user"; // 유저의 리듀서

// 스토어에 히스토리 넣어주기
export const history = createBrowserHistory();

// 만든 리듀서를 한 곳에 넣어줌
const rootReducer = combineReducers({
    user: User,
    router: connectRouter(history), // 위에서 만들어준 히스토리와 라우터가 연결됨
  });

  const middlewares = [thunk.withExtraArgument({history:history})];

// 지금이 어느 환경인 지 알려줌 (개발환경, 프로덕션(배포)환경 ...)
const env = process.env.NODE_ENV;

// 개발환경에서는 로거 사용
if (env === "development") { // 개발 환경일때
  const { logger } = require("redux-logger"); // 리덕스의 데이터에 뭐가 담기는지 콘솔에 찍힘
  middlewares.push(logger);
}

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

// 미들웨어 묶기
const enhancer = composeEnhancers(
    applyMiddleware(...middlewares)
    );

// 스토어 생성
let store = (initialStore) => createStore(rootReducer, enhancer);

export default store();