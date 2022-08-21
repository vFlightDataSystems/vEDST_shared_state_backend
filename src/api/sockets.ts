/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { activeUsers, sectors } from "../index";
import { canFlagTimeout, flagTimeout } from "./sectorTimeout";
import { SectorLoginDto } from "../types/sectorLoginDto";
import { ModifyAircraftDto } from "../types/modifyAircraftDto";

module.exports = function(server: Server) {

    const { Server } = require("socket.io");
    const io = new Server(server, {
        cors: {
            origin: process.env.corsOrigin,
        }
    });
    io.on('connection', (socket: Socket) => {

        const userInfo = {
            "id": socket.id,
            "sector": ""
        };

        socket.on('sectorLogon', (res: SectorLoginDto, callback?: (arg: any) => void) => {
            userInfo.sector = res.sector;
            activeUsers.set(userInfo.id, userInfo.sector);
            if (!sectors[userInfo.sector]) {
                sectors[userInfo.sector] = {
                    'id': userInfo.sector, timeModified: Date.now(), timeoutFlagged: false, aircraft: {}
                };
            }
            callback?.(sectors[userInfo.sector]);
        });

        socket.on('setHighlight', ({sector, aircraftId, value}: ModifyAircraftDto<boolean>) => {
            if (Object.keys(sectors[userInfo.sector].aircraft).includes(aircraftId)) {
                sectors[userInfo.sector].aircraft[aircraftId].highlighted = value;
            } else {
                sectors[userInfo.sector].aircraft[aircraftId] = {
                    aircraftId,
                    highlighted: value,
                    freetext: ''
                };
            }

            sectors[sector].timeModified = Date.now();
            socket.broadcast.emit("receiveAircraft", sectors[sector].aircraft[aircraftId]);
        });

        socket.on('setFreeText', ({sector, aircraftId, value}: ModifyAircraftDto<string>) => {
            if (Object.keys(sectors[userInfo.sector].aircraft).includes(aircraftId)) {
                sectors[userInfo.sector].aircraft[aircraftId].freetext = value;
            } else {
                sectors[userInfo.sector].aircraft[aircraftId] = {
                    aircraftId,
                    highlighted: false,
                    freetext: value
                };
            }

            sectors[sector].timeModified = Date.now();
            socket.broadcast.emit("receiveAircraft", sectors[sector].aircraft[aircraftId]);
        })

        socket.on('disconnect', () => {
            sectors[userInfo.sector].timeModified = Date.now();
            if (canFlagTimeout(userInfo.sector)) {
                flagTimeout(userInfo.sector);
            }
            activeUsers.delete(userInfo.id);
        });
    });
}

