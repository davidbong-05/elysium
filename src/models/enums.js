export const ApiResponseCode = Object.freeze({
  CODE_OK: 200,
  CODE_NOT_MODIFIED: 304,
  CODE_UNAUTHORIZED: 401,
  CODE_BAD_REQUEST: 400,
  CODE_NOT_FOUND: 404,
  CODE_INTERNAL_SERVER_ERROR: 500,
});

export const ErrorCode = Object.freeze({
  CODE_ALREADY_LINKED: "ALREADY_LINKED",
  CODE_NOT_LINKED: "NOT_LINKED",
  CODE_UNDEFINED_PARAMETER: "UNDEFINED_PARAMETER",
  CODE_UNVERIFIED: "UNVERIFIED",
});

export const ErrorSource = Object.freeze({
  CLIENT: "CLIENT",
  METAMASK: "METAMASK",
  SERVER: "SERVER",
});

export const MetaMaskResponseCode = Object.freeze({
  CODE_CHAIN_NOT_ADDED_IN_WALLET: 4902,
  CODE_USER_REJECTED: 4001,
  CODE_ACTION_REJECTED: "ACTION_REJECTED",
});

export const NftsContainerView = Object.freeze({
  VIEW_COLLECTION_ALL: "collection-all",
  VIEW_COLLECTION_LISTED: "collection-listed",
  VIEW_USER_OWNED: "user-owned",
  VIEW_USER_LISTED: "user-listed",
});

export const UserRole = Object.freeze({
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
  USER: "user",
  UNVERIFIED_USER: "unverified-user",
  GUEST: "guest",
});
