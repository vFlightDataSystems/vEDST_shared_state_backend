import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedGpdState } from "./sharedGpdState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";
import { Asel } from "./asel";
import { EdstWindow } from "../enums/edstWindow";

export class SharedUiState {
  acl = new SharedAclState();

  dep = new SharedDepState();

  gpd = new SharedGpdState();

  plansDisplay = new SharedPlansDisplayState();

  openWindows: EdstWindow[] = [];

  asel: Asel | null = null;
}