/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

const catapult = require('catapult-sdk');
const packetHeader = catapult.packet.header;
const {PacketType} = catapult.packet;

const {convert} = catapult.utils;

module.exports = {
	register: (server, db, services) => {
		const connections = services.connections;

		server.get('/network', (req, res, next) => {
			// forward entire config network section without formatting
			res.send(services.config.network);
			next();
		});

		server.get('/network/info', (req, res, next) => {
			const createPacketFromBuffer = (data, packetType) => {
				const length = packetHeader.size + data.length;
				const header = packetHeader.createBuffer(packetType, length);
				const buffers = [header, Buffer.from(data)];
				return Buffer.concat(buffers, length);
			};
			const packetBuffer = createPacketFromBuffer('', PacketType.nodeDiscoveryPullPing);
			return connections.lease()
				.then(connection => {
					const prom = connection.listen().then(message => {
						res.send(200, {message: convert.uint8ToHex(message)});
						next();
					});
					return connection.send(packetBuffer);
				});
		});
	}
};
