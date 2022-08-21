import { Aircraft } from "./aircraftDto";

export type Sector = {
  sectorId: string
  timeModified: number
  timeoutFlagged: boolean
  aircraft: Record<string, Aircraft>;
}