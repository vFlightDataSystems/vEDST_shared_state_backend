/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { activeUsers, sectors } from "../index";
import { canFlagTimeout, flagTimeout } from "./sectorTimeout";
import { SectorLoginDto } from "../types/sectorLoginDto";
import { ModifyAircraftDto } from "../types/modifyAircraftDto";
import { Sector } from "../types/sector";
import { Aircraft } from "../types/aircraft";

interface ClientToServerEvents {
    sectorLogon: (payload: SectorLoginDto, callback?: (arg: Record<string, Sector>) => void) => void;
    setHighlight: (payload: ModifyAircraftDto<boolean>) => void;
    setFreeText: (payload: ModifyAircraftDto<string>) => void;
}

interface ServerToClientEvents {
    receiveAircraft: (aircraft: Aircraft) => void
}

export default function(server: HttpServer) {

    const io = new Server<ClientToServerEvents, ServerToClientEvents, any, unknown>(server, {
        cors: {
            origin: process.env.corsOrigin,
        }
    });
    io.on('connection', (socket: Socket) => {
        console.log(socket);

        if (socket.handshake.auth?.token !== process.env.authToken) {
            socket.disconnect();
        }

        const userInfo = {
            id: socket.id,
            sectorId: ""
        };

        socket.on('sectorLogon', (sectorId: string, callback?: (arg: any) => void) => {
            userInfo.sectorId = sectorId;
            activeUsers.set(userInfo.id, userInfo.sectorId);
            if (!sectors[userInfo.sectorId]) {
                sectors[userInfo.sectorId] = {
                    'id': userInfo.sectorId, timeModified: Date.now(), timeoutFlagged: false, aircraft: {}
                };
            }
            callback?.(sectors[userInfo.sectorId]);
        });

        socket.on('setHighlight', ({sectorId, aircraftId, value}: ModifyAircraftDto<boolean>) => {
            if (Object.keys(sectors[userInfo.sectorId].aircraft).includes(aircraftId)) {
                sectors[userInfo.sectorId].aircraft[aircraftId].highlighted = value;
            } else {
                sectors[userInfo.sectorId].aircraft[aircraftId] = {
                    aircraftId,
                    highlighted: value,
                    freetext: ''
                };
            }

            sectors[sectorId].timeModified = Date.now();
            socket.broadcast.emit("receiveAircraft", sectors[sectorId].aircraft[aircraftId]);
        });

        socket.on('setFreeText', ({sectorId, aircraftId, value}: ModifyAircraftDto<string>) => {
            if (Object.keys(sectors[userInfo.sectorId].aircraft).includes(aircraftId)) {
                sectors[userInfo.sectorId].aircraft[aircraftId].freetext = value;
            } else {
                sectors[userInfo.sectorId].aircraft[aircraftId] = {
                    aircraftId,
                    highlighted: false,
                    freetext: value
                };
            }

            sectors[sectorId].timeModified = Date.now();
            socket.broadcast.emit("receiveAircraft", sectors[sectorId].aircraft[aircraftId]);
        })

        socket.on('disconnect', () => {
            if (sectors[userInfo.sectorId]) {
                sectors[userInfo.sectorId].timeModified = Date.now();
                if (canFlagTimeout(userInfo.sectorId)) {
                    flagTimeout(userInfo.sectorId);
                }
            }
            activeUsers.delete(userInfo.id);
        });
    });
}

