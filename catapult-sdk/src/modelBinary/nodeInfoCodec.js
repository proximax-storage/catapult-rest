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
		nodeInfo.size = parser.uint32();
		nodeInfo.publicKey = convert.uint8ToHex(parser.buffer(constants.sizes.signer));
		nodeInfo.port = parser.uint16();
		nodeInfo.networkIdentifier = parser.uint16();
		nodeInfo.version = parser.uint16();
		nodeInfo.roles = parser.uint16();
		nodeInfo.hostSize = parser.uint16();
		nodeInfo.friendlyNameSize = parser.uint16();
		nodeInfo.host = '';
		nodeInfo.friendlyName = '';

		return nodeInfo;
	},

	/**
	 * Serializes a node info.
	 * @param {object} nodeInfo The node info.
	 * @param {object} serializer The serializer.
	 */
	serialize: (nodeInfo, serializer) => {
		throw new Error('NOT IMPLEMENTED');
	}
};

module.exports = nodeInfoCodec;