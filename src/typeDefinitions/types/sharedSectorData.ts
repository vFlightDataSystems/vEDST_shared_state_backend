import { SharedAircraftDto } from "./sharedAircraftDto";
import { SharedUiState } from "./sharedUiState";

export class SharedSectorData {
  constructor(sectorId: string) {
    this.sectorId = sectorId;
  }

  sectorId = "";
  timeModified = Date.now();
  timeoutFlagged = false;
  uiState = new SharedUiState();
  aircraftData: Record<string, SharedAircraftDto> = {};
}
