/**
 * @author Cian Ormond <co@cianormond.com>
 */

import {Server, Socket} from "socket.io";
import {activeUsers, cleanActiveUsers, getAircraftIndex, getSectorIndex, sectors} from "../index";
import {canFlagTimeout, flagTimeout} from "./sectorTimeout";

module.exports = function(server: Server) {

    const { Server } = require("socket.io");
    const io = new Server(server);
    io.on('connection', (socket: Socket) => {

        const userInfo = {
            "id": socket.id,
            "sector": ""
        };

        socket.on('logon sector', (res: string) => {
            userInfo.sector = JSON.parse(res).sector;
            activeUsers.set(userInfo.id, userInfo.sector);
            if (getSectorIndex(userInfo.sector) === -1) {
                sectors[sectors.length] = {
                    'id': userInfo.sector, timeModified: Date.now(), timeoutFlagged: false, 'aircraft': []
                };
            }
            socket.emit('response logon sector', sectors[getSectorIndex(userInfo.sector)]);
        });

        socket.on('request sector', () => socket.send(sectors[getSectorIndex(userInfo.sector)]));

        socket.on('request aircraft', (res: string) => socket.send(sectors[getSectorIndex(userInfo.sector)].aircraft[getAircraftIndex(JSON.parse(res).cid, userInfo.sector)]));

        socket.on('change aircraft highlight', (res: string) => {
            const cid = JSON.parse(res).cid;
            const highlighted = JSON.parse(res).highlighted;
            const sectorIndex = getSectorIndex(userInfo.sector);

            if (getAircraftIndex(cid, userInfo.sector) === -1) {
                sectors[sectorIndex].aircraft.push({
                    cid: cid,
                    highlighted: highlighted,
                    freetext: ''
                });
            } else {
                sectors[sectorIndex].aircraft[getAircraftIndex(cid, userInfo.sector)].highlighted = highlighted;
            }

            sectors[sectorIndex].timeModified = Date.now();
        });

        socket.on('change aircraft freetext', (res: string) => {
            const cid = JSON.parse(res).cid;
            const freetext = JSON.parse(res).freetext;
            const sectorIndex = getSectorIndex(userInfo.sector);

            if (getAircraftIndex(cid, userInfo.sector) === -1) {
                sectors[sectorIndex].aircraft.push({
                    cid: cid,
                    highlighted: false,
                    freetext: freetext
                });
            } else {
                sectors[sectorIndex].aircraft[getAircraftIndex(cid, userInfo.sector)].freetext = freetext;
            }

            sectors[sectorIndex].timeModified = Date.now();
        })

        socket.on('disconnect', () => {
            activeUsers.set(userInfo.id, 'null');
            cleanActiveUsers();
            sectors[getSectorIndex(userInfo.sector)].timeModified = Date.now();
            if (canFlagTimeout(userInfo.sector)) flagTimeout(userInfo.sector);
        });
    });
}

