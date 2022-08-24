import { DepSortOption } from "../enums/depSortOption";

export class SharedDepState {
  open = false;

  sortOption = DepSortOption.ACID;

  manualPosting = true;
}
