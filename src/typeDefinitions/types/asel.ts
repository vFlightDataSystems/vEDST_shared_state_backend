import { EdstWindow } from "../enums/edstWindow";
import { AclRowField } from "../enums/aclRowField";
import { DepRowField } from "../enums/depRowField";
import { PlanRowField } from "../enums/planRowField";
import { AircraftId } from "./aircraftId";

export type Asel = { aircraftId: AircraftId; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };