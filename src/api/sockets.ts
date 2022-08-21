/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { activeUsers, sectors } from "../index";
import { canFlagTimeout, flagTimeout } from "./sectorTimeout";
import { AircraftDto } from "../types/aircraftDto";

interface ClientToServerEvents {
    updateAircraft: (sectorId: string, payload: AircraftDto) => void;
}

interface ServerToClientEvents {
    receiveAircraft: (aircraft: AircraftDto) => void
}

export default function(server: HttpServer) {

    const io = new Server(server, {
        cors: {
            origin: process.env.corsOrigin,
        }
    });
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {

        const sectorId = socket.handshake.query.sectorId;

        if (socket.handshake.auth?.token !== process.env.authToken || !(typeof sectorId === "string")) {
            socket.disconnect();
        }

        const userInfo = {
            id: socket.id,
            sectorId: sectorId as string
        };

        if (!sectors[userInfo.sectorId]) {
            sectors[userInfo.sectorId] = {
                sectorId: userInfo.sectorId, timeModified: Date.now(), timeoutFlagged: false, aircraft: {}
            };
        }

        socket.join(userInfo.sectorId);

        function emitAircraft(aircraftId: string) {
            io.to(userInfo.sectorId).emit("receiveAircraft", sectors[userInfo.sectorId].aircraft[aircraftId])
        }

        socket.on('updateAircraft', (sectorId, aircraft) => {
                sectors[userInfo.sectorId].aircraft[aircraft.aircraftId] = aircraft;

            sectors[sectorId].timeModified = Date.now();
            emitAircraft(aircraft.aircraftId);
        });

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

