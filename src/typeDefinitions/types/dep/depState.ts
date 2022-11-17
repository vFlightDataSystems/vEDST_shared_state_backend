import {DepRowField} from "./depRowField";

export class DepState {
  selectedSortOption: DepRowField = "FID_DEP_ROW_FIELD";
  manualPosting = true;
  hiddenColumns: DepRowField[] = [];
}
