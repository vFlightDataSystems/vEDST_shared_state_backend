import { AclSortOption } from "../enums/aclSortOption";
import { AclRowField } from "../enums/aclRowField";

type AclSortData = { selectedOption: AclSortOption; sector: boolean };
type ToolsOptions = { displayCoordinationColumn: boolean; dropTrackDelete: boolean; iafDofManual: boolean; nonRvsmIndicator: boolean };

export class AclState {
  sortData: AclSortData = { selectedOption: AclSortOption.ACID, sector: false };
  manualPosting = true;
  toolsOptions: ToolsOptions = {
    displayCoordinationColumn: false,
    dropTrackDelete: false,
    iafDofManual: false,
    nonRvsmIndicator: false
  };
  hiddenColumns: AclRowField[] = [];
}
