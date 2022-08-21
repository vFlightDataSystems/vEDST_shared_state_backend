/**
 * @author Cian Ormond <co@cianormond.com>
 */

import express from 'express';
import {sectors} from "../index";

const router = express.Router();

/**
 * Return all aircraft or time modified for one sector
 */
router.get('/:sector/sec/:info', (req, res) => {
    const sector: string = req.params.sector;
    const info: string = req.params.info;
    if (!sectors[sector]) {
        res.send("No such sector");
    } else {
        switch (info) {
            default:
                res.send("No such info");
                break;
            case 'time':
                res.send(sectors[sector].timeModified.toString());
                break;
            case 'aircraft':
                const aircraft = sectors[sector].aircraft;
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
 * Return one specific aircraft in one sector
 */
router.get('/:sector/ac/:aircraftId/', (req, res) => {
    const sector: string = req.params.sector;
    const ac = sectors[sector]?.aircraft?.[req.params.aircraftId];

    res.send(ac ?? "No such aircraft");
})

/**
 * Return freetext or highlighted status for one specific aircraft in one sector
 */
router.get('/:sector/ac/:aircraftId/:info', (req, res) => {
    const sector: string = req.params.sector;
    const info: string = req.params.info;
    const ac = sectors[sector]?.aircraft?.[req.params.aircraftId];

    if (!ac) {
        res.send("No such aircraft");
    }
    else {
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
    }


})

module.exports = router;