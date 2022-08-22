import { AircraftDto } from "./aircraftDto";

export type SharedSectorData = {
  sectorId: string
  timeModified: number
  timeoutFlagged: boolean
  aircraftData: Record<string, AircraftDto>;
}