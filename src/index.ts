/**
 * @author Cian Ormond <co@cianormond.com>
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

//TODO better documentation
//TODO better organisation

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

let sectors: Sector[] = [
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
function getSectorIndex(sector: string): number {
    let indexes: string[] = [];
    sectors.forEach(sec => indexes.push(sec.id));

    return indexes.findIndex(sectorId => sectorId === sector);
}

/**
 * Finds index of aircraft in its sector's array
 * @param cid CID to find
 * @param sector Sector that possses aircraft
 * @returns Index in sector's aircraft array
 */
function getAircraftIndex(cid: number, sector: string): number {
    let indexes: number[] = [];
    sectors[getSectorIndex(sector)].aircraft.forEach(ac => indexes.push(ac.cid));

    return indexes.findIndex(aircraftId => aircraftId === cid);

}

app.listen(port, () => console.log('Listening on port ' + port))

/**
 * Return all aircraft or time modified for one sector
 */
app.get('/:sector/:info', (req, res) => {
    const sector: string = req.params.sector;
    const info: string = req.params.info;
    let sectorIndex: number = getSectorIndex(sector);
    if (sectorIndex === -1) {
        res.send("No such sector");
        return;
    }

    switch (info) {
        default:
            res.send("No such info");
            break;
        case 'time':
            res.send(sectors[sectorIndex].timeModified);
            break;
        case 'aircraft':
            const aircraft = sectors[sectorIndex].aircraft;
            if (aircraft.length == 0) {
                res.send(null);
                return;
            }

            res.send(aircraft);
            break;
    }
})

/**
 * Return one specific aircraft in one sector
 */
app.get('/:sector/:cid/', (req, res) => {
    const sector: string = req.params.sector;
    const cid: number = parseInt(req.params.cid);
    let aircraftIndex: number = getAircraftIndex(cid, sector);
    if (aircraftIndex === -1) {
        res.send("No such aircraft");
        return;
    }

    res.send(sectors[aircraftIndex].aircraft[aircraftIndex]);
})

/**
 * Return freetext or highlighted status for one specific aircraft in one sector
 */
app.get('/:sector/:cid/:info', (req, res) => {
    const sector: string = req.params.sector;
    const cid: number = parseInt(req.params.cid);
    const info: string = req.params.info;

    const aircraftIndex: number = getAircraftIndex(cid, sector);
    if (aircraftIndex === -1) {
        res.send("No such aircraft");
        return;
    }
    const ac = sectors[aircraftIndex].aircraft[aircraftIndex];

    switch (info) {
        default:
            res.send("No such info")
            break;
        case 'freetext':
            res.send(ac.freetext);
            break;
        case 'highlighted':
            res.send(ac.highlighted);
            break;
    }
})