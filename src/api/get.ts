/**
 * @author Cian Ormond <co@cianormond.com>
 */

import express from 'express';
import {getSectorIndex, getAircraftIndex, sectors, } from "../index";

const router = express.Router();

/**
 * Return all aircraft or time modified for one sector
 */
router.get('/:sector/:info', (req, res) => {
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
            res.send(sectors[sectorIndex].timeModified.toString());
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
router.get('/:sector/:cid/', (req, res) => {
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
router.get('/:sector/:cid/:info', (req, res) => {
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

module.exports = router;