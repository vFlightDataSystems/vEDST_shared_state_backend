import { AclSortOption } from "../enums/aclSortOption";

export class SharedAclState {
  sortOption = AclSortOption.ACID;

  sortSector = false;

  manualPosting = true;
}