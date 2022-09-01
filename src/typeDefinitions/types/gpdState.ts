enum SectorType {
  ultraLow = "UL",
  low = "L",
  high = "H",
  ultraHigh = "UH",
  lowHigh = "LH"
}

enum MapFeatureOption {
  ultraLowSectors = "Ultra Low",
  lowSectors = "Low",
  highSectors = "High",
  ultraHighSectors = "Ultra High",
  centerBoundaries = "Center Boundaries",
  approachBoundaries = "Approach Control Boundaries",
  airport = "Airport",
  airportLabels = "Airport Labels",
  Jairways = "J Airways",
  Qairways = "Q Airways",
  Vairways = "V Airways",
  Tairways = "T Airways",
  navaid = "NAVAIDS",
  navaidLabels = "NAVAID Labels",
  waypoint = "Waypoints",
  waypointLabels = "Waypoint Labels"
}
type MapFeatureOptions = Partial<Record<MapFeatureOption, boolean>>;

type AircraftDisplayOptions = {
  aircraftListFilter: ["Aircraft List Filter", boolean];
  altitudeFilterLimits: ["Altitude Filter Limits", boolean];
  filterAbove: ["Filter Above", number | null];
  filterBelow: ["Filter Below", number | null];
  autoDatablockOffset: ["Auto Datablock Offset", boolean];
  mspLabels: ["MSP/MEP Labels", boolean];
  routePreviewMinutes: ["Route Preview (minutes)", number];
};

type GpdConfiguration = Record<string, unknown> | null;

export class GpdState {
  gpdConfiguration: GpdConfiguration = null;
  mapFeatureOptions: MapFeatureOptions = {
    [MapFeatureOption.lowSectors]: true,
    [MapFeatureOption.highSectors]: true
  }
  aircraftDisplayOptions: AircraftDisplayOptions = {
    aircraftListFilter: ["Aircraft List Filter", false],
    altitudeFilterLimits: ["Altitude Filter Limits", false],
    filterAbove: ["Filter Above", null],
    filterBelow: ["Filter Below", null],
    autoDatablockOffset: ["Auto Datablock Offset", false],
    mspLabels: ["MSP/MEP Labels", false],
    routePreviewMinutes: ["Route Preview (minutes)", 0]
  };
  suppressed: boolean = false;
  planData: Record<string, unknown>[] = [];
}
