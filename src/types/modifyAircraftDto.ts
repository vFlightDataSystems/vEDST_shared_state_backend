export type ModifyAircraftDto<T> = {
  sectorId: string;
  aircraftId: string;
  value: T
}