import { AclSortOption } from "../enums/aclSortOption";

export class SharedAclState {
  open = false;
  sortOption = AclSortOption.ACID;
  sortSector = false;
  manualPosting = true;
}