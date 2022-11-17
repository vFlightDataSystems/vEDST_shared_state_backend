import { Asel } from "./asel";
import { DepState } from "./dep/depState";
import { AclState } from "./acl/aclState";
import { PlanState } from "./planState";
import { GpdState } from "./gpdState";
import {EdstWindow} from "./edstWindow";

export class SharedUiState {
  acl = new AclState();

  dep = new DepState();

  gpd = new GpdState();

  plansDisplay = new PlanState();

  openWindows: EdstWindow[] = [];

  asel: Asel | null = null;
}