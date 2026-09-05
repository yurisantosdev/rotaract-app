const NoticesActionType = {
  NOTICES_REQUEST: "notices/request",
  NOTICES_SUCCESS: "notices/success",
  NOTICES_FAILURE: "notices/failure",
  NOTICES_ADD: "notices/add",
  NOTICES_UPDATE: "notices/update",
  NOTICES_CLEAN: "notices/clean",
} as const;

export default NoticesActionType;
