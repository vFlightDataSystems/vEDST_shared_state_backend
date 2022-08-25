import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedGpdState } from "./sharedGpdState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";

export class SharedUiState {
  acl = new SharedAclState();
  dep = new SharedDepState();
  gpd = new SharedGpdState();
  plansDisplay = new SharedPlansDisplayState();
}