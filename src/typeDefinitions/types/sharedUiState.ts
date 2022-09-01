import { Asel } from "./asel";
import { EdstWindow } from "../enums/edstWindow";
import { DepState } from "./depState";
import { AclState } from "./aclState";
import { PlanState } from "./planState";
import { GpdState } from "./gpdState";

export class SharedUiState {
  acl = new AclState();

  dep = new DepState();

  gpd = new GpdState();

  plansDisplay = new PlanState();

  openWindows: EdstWindow[] = [];

  asel: Asel | null = null;
}