/**
 * @author Cian Ormond <co@cianormond.com>
 */

import express from 'express';
import {sectorData} from "../index";

const router = express.Router();

/**
 * Return all aircraft or time modified for one sectorId
 */
router.get('/:sectorId/sec/:info', (req, res) => {
    const sectorId: string = req.params.sectorId;
    const info: string = req.params.info;
    if (!sectorData[sectorId]) {
        res.send("No such sector");
    } else {
        switch (info) {
            default:
                res.send("No such info");
                break;
            case 'time':
                res.send(sectorData[sectorId].timeModified.toString());
                break;
            case 'aircraft':
                const aircraft = sectorData[sectorId].aircraftData;
                if (Object.keys(aircraft)) {
                    res.send(null);
                    return;
                }

                res.send(aircraft);
                break;
        }
    }
})

/**
 * Return one specific aircraft in one sectorId
 */
router.get('/:sectorId/ac/:aircraftId/', (req, res) => {
    const sectorId: string = req.params.sectorId;
    const ac = sectorData[sectorId]?.aircraftData?.[req.params.aircraftId];

    res.send(ac ?? "No such aircraft");
})

module.exports = router;