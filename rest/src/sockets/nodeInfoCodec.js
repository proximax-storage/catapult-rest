/** @module modelBinary/nodeInfoCodec */
const catapult = require('catapult-sdk');

const { size } = catapult.modelBinary;
const { convert } = catapult.utils;

const nodeInfoCodec = {
	/**
	 * Parses a node info.
	 * @param {object} parser The parser.
	 * @returns {object} The parsed node info.
	 */
	deserialize: parser => {
		const nodeInfo = {};
		parser.uint32(); // size
		nodeInfo.publicKey = convert.uint8ToHex(parser.buffer(size.signer));
		nodeInfo.port = parser.uint16();
		nodeInfo.networkIdentifier = parser.uint8();
		nodeInfo.version = parser.uint32();
		nodeInfo.roles = parser.uint32();
		const hostSize = parser.uint8();
		const friendlyNameSize = parser.uint8();
		nodeInfo.host = 0 === hostSize ? '' : parser.buffer(hostSize).toString('ascii');
		nodeInfo.friendlyName = 0 === friendlyNameSize ? '' : parser.buffer(friendlyNameSize).toString('ascii');

		return nodeInfo;
	}
};

module.exports = nodeInfoCodec;
