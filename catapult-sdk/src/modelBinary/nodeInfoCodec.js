/** @module modelBinary/nodeInfoCodec */
const sizes = require('./sizes');
const convert = require('../utils/convert');

const constants = { sizes };

const nodeInfoCodec = {
	/**
	 * Parses a node info.
	 * @param {object} parser The parser.
	 * @returns {object} The parsed node info.
	 */
	deserialize: parser => {
		const nodeInfo = {};
		parser.uint32(); // size
		nodeInfo.publicKey = convert.uint8ToHex(parser.buffer(constants.sizes.signer));
		nodeInfo.port = parser.uint16();
		nodeInfo.networkIdentifier = parser.uint16();
		nodeInfo.version = parser.uint16();
		nodeInfo.roles = parser.uint32();
		const hostSize = parser.uint8();
		const friendlyNameSize = parser.uint8();
		nodeInfo.host = 0 === hostSize ? '' : convert.uint8ToHex(parser.buffer(hostSize));
		nodeInfo.friendlyName = 0 === friendlyNameSize ? '' : convert.uint8ToHex(parser.buffer(friendlyNameSize));

		return nodeInfo;
	},

	/* eslint-disable no-unused-vars */

	/**
	 * Serializes a node info.
	 * @param {object} nodeInfo The node info.
	 * @param {object} serializer The serializer.
	 */
	serialize: (nodeInfo, serializer) => {
		throw new Error('NOT IMPLEMENTED');
	}
	/* eslint-enable */
};

module.exports = nodeInfoCodec;
