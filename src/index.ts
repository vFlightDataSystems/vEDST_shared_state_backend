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
    aircraft: Aircraft[]
}

type Aircraft = {
    id: number
    highlighted: boolean
    freetext: string
}

let sectors: Sector[] = [
    {
        id: 'ZLC-33',
        aircraft: [
            {
                id: 588,
                highlighted: true,
                freetext: 'hi'
            }
        ]
    }
]

let sectorIndexes: string[] = [];

function updateSectorIndexes() {
    sectors.forEach(sec => sectorIndexes.push(sec.id));
}

app.listen(port, () => console.log('Listening on port ' + port))

/**
 * Return all aircraft for one sector
 */
app.get('/:sector/', (req, res) => {
    const sector: string = req.params.sector;
    updateSectorIndexes();
    let sectorIndex: number = sectorIndexes.findIndex(sectorId => sectorId === sector);
    if (sectorIndex === -1) {
        res.send("No such sector");
        return;
    }

    const aircraft = sectors[sectorIndex].aircraft;

    if (aircraft.length == 0) {
        res.send(null);
        return;
    }

    res.send(aircraft);
})