import { AircraftId } from "./aircraftId";

export type SharedAircraftDto = {
  aircraftId: AircraftId;
  spa: boolean;
  aclDisplay: boolean;
  aclDeleted: boolean;
  depDisplay: boolean;
  depDeleted: boolean;
  vciStatus: -1 | 0 | 1;
  depStatus: -1 | 0 | 1;
  aclHighlighted: boolean;
  depHighlighted: boolean;
  freeTextContent: string;
  showFreeText: boolean;
}