import { AircraftId } from "../aircraftId";

export type CreateOrAmendFlightplanDto = {
  aircraftId: AircraftId;
  assignedBeaconCode: number | null;
  equipment: string;
  speed: number;
  altitude: string;
  departure: string;
  destination: string;
  alternate: string;
  route: string;
  estimatedDepartureTime: number;
  actualDepartureTime: number;
  fuelHours: number;
  fuelMinutes: number;
  hoursEnroute: number;
  minutesEnroute: number;
  pilotCid: string;
  remarks: string;
}