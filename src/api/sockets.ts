/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { activeUsers, sectorData } from "../index";
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

        if (!sectorData[userInfo.sectorId]) {
            sectorData[userInfo.sectorId] = {
                sectorId: userInfo.sectorId, timeModified: Date.now(), timeoutFlagged: false, aircraftData: {}
            };
        }

        Object.values(sectorData[userInfo.sectorId].aircraftData).forEach(aircraft => emitAircraftToRoom(aircraft.aircraftId));

        socket.join(userInfo.sectorId);

        function emitAircraftToRoom(aircraftId: string) {
            io.to(userInfo.sectorId).emit("receiveAircraft", sectorData[userInfo.sectorId].aircraftData[aircraftId])
        }

        socket.on('updateAircraft', (sectorId, aircraft) => {
            sectorData[userInfo.sectorId].aircraftData[aircraft.aircraftId] = aircraft;

            sectorData[sectorId].timeModified = Date.now();
            emitAircraftToRoom(aircraft.aircraftId);
        });

        socket.on('disconnect', () => {
            if (sectorData[userInfo.sectorId]) {
                sectorData[userInfo.sectorId].timeModified = Date.now();
                if (canFlagTimeout(userInfo.sectorId)) {
                    flagTimeout(userInfo.sectorId);
                }
            }
            activeUsers.delete(userInfo.id);
        });
    });
}

