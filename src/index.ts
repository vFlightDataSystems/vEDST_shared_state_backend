/**
 * @author Cian Ormond <co@cianormond.com>
 */

import express from 'express';
import bodyParser from 'body-parser';

const app: express.Application = express();
const port: number = 3000;

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

type Sector = {
    id: string
    timeModified: number
    aircraft: Aircraft[]
}

type Aircraft = {
    cid: number
    highlighted: boolean
    freetext: string
}

export let sectors: Sector[] = [
    {
        id: 'ZLC-33',
        timeModified: 1660175685,
        aircraft: [
            {
                cid: 588,
                highlighted: true,
                freetext: 'hi'
            }
        ]
    }
]

/**
 * Finds index of sectors in sectors array
 * @param sector Sector ID to find
 * @returns Index in sectors array
 */
export function getSectorIndex(sector: string): number {
    let indexes: string[] = [];
    sectors.forEach(sec => indexes.push(sec.id));

    return indexes.findIndex(sectorId => sectorId === sector);
}

/**
 * Finds index of aircraft in its sector's array
 * @param cid CID to find
 * @param sector Sector that possesses aircraft
 * @returns Index in sector's aircraft array
 */
export function getAircraftIndex(cid: number, sector: string): number {
    let indexes: number[] = [];
    sectors[getSectorIndex(sector)].aircraft.forEach(ac => indexes.push(ac.cid));

    return indexes.findIndex(aircraftId => aircraftId === cid);

}

// Use GET routes from api/get.ts
app.use('/', require('./api/get.ts'));

app.listen(port, () => console.log('Listening on port ' + port))