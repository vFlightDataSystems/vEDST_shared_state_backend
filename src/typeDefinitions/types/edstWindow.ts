export const edstMenus = [
  "PLAN_OPTIONS",
  "ACL_SORT_MENU",
  "DEP_SORT_MENU",
  "TOOLS_MENU",
  "ALTITUDE_MENU",
  "ROUTE_MENU",
  "SPEED_MENU",
  "HEADING_MENU",
  "HOLD_MENU",
  "TEMPLATE_MENU",
  "EQUIPMENT_TEMPLATE_MENU",
  "GPD_MAP_OPTIONS_MENU",
  // PROMPTS
  "PREV_ROUTE_MENU",
  "CANCEL_HOLD_MENU",
  "CHANGE_DEST_MENU",
] as const;

export const edstWindows = [
  "ACL",
  "DEP",
  "GPD",
  "PLANS_DISPLAY",
  "MESSAGE_COMPOSE_AREA",
  "MESSAGE_RESPONSE_AREA",
  "STATUS",
  "OUTAGE",
  "METAR",
  "UA",
  "SIGMETS",
  "GI",
  "ADSB",
  "SAT",
  "MSG",
  "WIND",
  "ALTIMETER",
  "FEL",
  "MORE",
  "CPDLC_HIST",
  "CPDLC_MSG",
].concat(edstMenus);

export type EdstWindow = typeof edstWindows[number];
export type EdstMenu = typeof edstMenus[number];
