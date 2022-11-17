import { AircraftId } from "./aircraftId";
import {EdstWindow} from "./edstWindow";
import {DepRowField} from "./dep/depRowField";
import {PlanRowField} from "./planRowField";
import {AclRowField} from "./acl/aclRowField";

export type Asel = { aircraftId: AircraftId; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };