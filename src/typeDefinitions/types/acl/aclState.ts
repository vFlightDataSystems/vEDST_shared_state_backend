import {AclSortOption} from "./aclSortOption";
import {AclRowField} from "./aclRowField";

type AclSortData = { selectedOption: AclSortOption; sector: boolean };
type ToolsOptions = { displayCoordinationColumn: boolean; dropTrackDelete: boolean; iafDofManual: boolean; nonRvsmIndicator: boolean };

export class AclState {
  sortData: AclSortData = { selectedOption: "ACL_ACID_SORT_OPTION", sector: false };
  manualPosting = true;
  toolsOptions: ToolsOptions = {
    displayCoordinationColumn: false,
    dropTrackDelete: false,
    iafDofManual: false,
    nonRvsmIndicator: false
  };
  hiddenColumns: AclRowField[] = [];
}
