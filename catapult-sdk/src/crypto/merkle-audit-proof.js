const NodePositionEnum = Object.freeze({
	Left: 1,
	Right: 2
});

class HashNotFoundError extends Error {}

const getRootHash = tree => tree.tree[tree.tree.length - 1];

const evenify = number => (number % 2 ? number + 1 : number);

const indexOfNodeWithHash = (hash, tree) => tree.tree.slice(0, evenify(tree.numberOfTransactions)).indexOf(hash);

const siblingOf = nodeIndex => {
	if (0 > nodeIndex)
		return null;

	if (nodeIndex % 2) {
		return {
			position: NodePositionEnum.Left,
			index: nodeIndex - 1
		};
	}
	// Else
	return {
		position: NodePositionEnum.Right,
		index: nodeIndex + 1
	};
};

const buildAuditPath = (hash, tree) => {
	let layerStart = 0;
	let currentLayerCount = tree.numberOfTransactions;
	let layerSubindexOfHash = indexOfNodeWithHash(hash, tree);
	if (-1 === layerSubindexOfHash)
		throw new HashNotFoundError();

	const auditPath = [];
	while (1 !== currentLayerCount) {
		currentLayerCount = evenify(currentLayerCount);
		const sibling = siblingOf(layerStart + layerSubindexOfHash);
		const siblingPathNode = {
			hash: tree.tree[sibling.index],
			position: sibling.position
		};
		auditPath.push(siblingPathNode);
		layerStart += currentLayerCount;
		currentLayerCount /= 2;
		layerSubindexOfHash = Math.floor(layerSubindexOfHash / 2);
	}
	return auditPath;
};

module.exports = {
	buildAuditPath,
	getRootHash,
	evenify,
	indexOfNodeWithHash,
	siblingOf,
	NodePositionEnum,
	HashNotFoundError
};
