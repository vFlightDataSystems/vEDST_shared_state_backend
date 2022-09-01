import { DepSortOption } from "../enums/depSortOption";
import { DepRowField } from "../enums/depRowField";

export class DepState {
  selectedSortOption = DepSortOption.ACID;
  manualPosting = true;
  hiddenColumns: DepRowField[] = [];
}