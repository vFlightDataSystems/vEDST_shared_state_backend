import { Aircraft } from "./aircraft";

export type Sector = {
  id: string
  timeModified: number
  timeoutFlagged: boolean
  aircraft: Record<string, Aircraft>;
}