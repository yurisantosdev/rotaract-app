export { Notice } from "./components/notice";
export { default as noticesReducer } from "./redux/reduce";
export type {
  NoticesRootState,
  NoticesState,
  NoticesStatus,
} from "./redux/reduce";
export {
  loadNotices,
  noticesAdd,
  noticesClean,
  noticesUpdate,
} from "./redux/actions";
export {
  useNotices,
  useNoticesError,
  useNoticesStatus,
} from "./redux/hooks";
