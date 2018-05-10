const { expect } = require('chai');
const {
	indexOfNodeWithHash, buildAuditPath, getRootHash,
	NodePositionEnum, siblingOf, HashNotFoundError
} = require('../../src/crypto/merkle-audit-proof.js');

const merkleTree = {
	numberOfTransactions: 4,
	tree: [
		'8d25b2639a7d12feaaaef34358b215e97533f9ffdda5b9fadfd8ecc229695263',
		'8ab2f19a47c5b30cc389ae1580f0472b4d3afeea83cdf0f707d03ed76b15a00c',
		'b9840c4eadb6724a2dfca81d5e90ef3f4ee91beb63a58fa91a4f05e951f08fcf',
		'b9840c4eadb6724a2dfca81d5e90ef3f4ee91beb63a58fa91a4f05e951f08fcf',
		'586b203612b0e5ca695cff677a5b784e4368b79c1a7b272036105753a915edc9',
		'aa1dfff01b3aba492188195df4d77af25ff9d57df4ea0fd6fe498d572b6e67fd',
		'16d28dd7af87b86c79273450470e96f22c66f8ef4598064603699b69f10464d0'
	]
};

const merkleTreeLong = {
	numberOfTransactions: 6,
	tree: [
		'A983745F69959AF438C5B59501B7B6FCD4312DE1F5252A6E8B54D09E23266A7C',
		'5A639C5865FFA3331C3315BE2797F490D7D9C12826AF08C3643929DCAC391E21',
		'F95D66CCB9B788A582FB35ABB4328BD705E2DB97D3F2EFAED46C88584A87E202',
		'C11A995692E24FE9A79B657375AA051D97B5261C14A2F08792AE5269F412BD8F',
		'0CDD981B532DDB0789A3B7F96B37FA0973EE6EB1D41FA8AA8E0411BA2FB07851',
		'C7F87E9FC96202ECE5F219EA87A2C02363B763520A1D7B08F0D2037FFF7CC1E0',
		'5EEEF952CE75555C24C4820E7BE36370B0AD9ABFE357D4244AC1DA1E1102229A',
		'EFAE07E3096428E93611072581F769F12758345BEE2779A3B20326F8A1A6C373',
		'DF646700D4CDBA8DF803EE27F0E8DE59A32AD95E74803C342431F1234E9D054C',
		'DF646700D4CDBA8DF803EE27F0E8DE59A32AD95E74803C342431F1234E9D054C',
		'9ED4FE218563EE52D2AE18CAFD9CD12A403EAD9737EFC1B8AADD892A87699AB5',
		'11E903589FAE58D8DDB460F11F33A80A9B2CF09D4B50FCC615C5440337CEBE4F',
		'F1BDD998E8C54C8B71CEC7B9AAC14E3A0B93F2EC93E445542885F29DA5375787'
	]
};

describe('indexOfNodeWithHash function', () => {
	it('should return -1 if hash not found in tree', () => {
		expect(indexOfNodeWithHash('aaaaaaa', merkleTree)).to.equal(-1);
	});

	it('should return -1 if hash not found in tree leaves', () => {
		expect(indexOfNodeWithHash(merkleTree.tree[4], merkleTree)).to.equal(-1);
	});

	it('should return -1 if hash not found in an empty tree', () => {
		expect(indexOfNodeWithHash('aaaaaaa', { tree: [], numberOfTransactions: 0 })).to.equal(-1);
	});

	it('should return the index for a found node', () => {
		expect(indexOfNodeWithHash(merkleTree.tree[0], merkleTree)).to.equal(0);
		expect(indexOfNodeWithHash(merkleTree.tree[2], merkleTree)).to.equal(2);
	});

	it('should return the index for a found node in the first leaf', () => {
		expect(indexOfNodeWithHash(merkleTree.tree[0], merkleTree)).to.equal(0);
	});

	it('should return the index for a found duplicated node in the last leaf out of the number of transactions', () => {
		const merkleTree2 = {
			numberOfTransactions: 3,
			tree: [
				'8d25b2639a7d12feaaaef34358b215e97533f9ffdda5b9fadfd8ecc229695263',
				'8ab2f19a47c5b30cc389ae1580f0472b4d3afeea83cdf0f707d03ed76b15a00c',
				'b9840c4eadb6724a2dfca81d5e90ef3f4ee91beb63a58fa91a4f05e951f08fcf',
				'b9840c4eadb6724a2dfca81d5e90ef3f4ee91beb63a58fa91a4f05e951f08fcf',
				'586b203612b0e5ca695cff677a5b784e4368b79c1a7b272036105753a915edc9',
				'aa1dfff01b3aba492188195df4d77af25ff9d57df4ea0fd6fe498d572b6e67fd',
				'16d28dd7af87b86c79273450470e96f22c66f8ef4598064603699b69f10464d0'
			]
		};
		expect(indexOfNodeWithHash(merkleTree2.tree[2], merkleTree2)).to.equal(2);
	});
});

describe('buildAuditPath function', () => {
	it('should return the hash, position and index in the result', () => {
		const trail = buildAuditPath(merkleTree.tree[2], merkleTree);
		expect(trail[0]).to.have.property('position');
		expect(trail[0]).to.have.property('hash');
		expect(trail[1]).to.have.property('position');
		expect(trail[1]).to.have.property('hash');
	});

	it('should return an empty audit proof trail for a single node tree', () => {
		const trail = buildAuditPath(merkleTree.tree[0], { tree: [merkleTree.tree[0]], numberOfTransactions: 1 });
		expect(trail.length).to.equal(0);
	});

	it('should throw if hash not in tree', () => {
		expect(buildAuditPath.bind(buildAuditPath, 'xxxxxxxxxx', merkleTree)).to.throw(HashNotFoundError);
	});

	it('should throw if hash in tree but not leaf', () => {
		expect(buildAuditPath.bind(buildAuditPath, merkleTree.tree[4], merkleTree)).to.throw(HashNotFoundError);
		expect(buildAuditPath.bind(buildAuditPath, merkleTree.tree[6], merkleTree)).to.throw(HashNotFoundError);
	});

	it('should return correctly if number of transactions even', () => {
		const merkleTree2 = {
			numberOfTransactions: 3,
			tree: [
				'8d25b2639a7d12feaaaef34358b215e97533f9ffdda5b9fadfd8ecc229695263',
				'8ab2f19a47c5b30cc389ae1580f0472b4d3afeea83cdf0f707d03ed76b15a00c',
				'b9840c4eadb6724a2dfca81d5e90ef3f4ee91beb63a58fa91a4f05e951f08fcf',
				'b9840c4eadb6724a2dfca81d5e90ef3f4ee91beb63a58fa91a4f05e951f08fcf',
				'586b203612b0e5ca695cff677a5b784e4368b79c1a7b272036105753a915edc9',
				'aa1dfff01b3aba492188195df4d77af25ff9d57df4ea0fd6fe498d572b6e67fd',
				'16d28dd7af87b86c79273450470e96f22c66f8ef4598064603699b69f10464d0'
			]
		};
		const trail0 = buildAuditPath(merkleTree2.tree[0], merkleTree2);
		expect(trail0.length).to.equal(2);
		expect(trail0[0].hash).to.equal(merkleTree2.tree[1]);
		const trail1 = buildAuditPath(merkleTree2.tree[1], merkleTree2);
		expect(trail1.length).to.equal(2);
		expect(trail1[0].hash).to.equal(merkleTree2.tree[0]);
		const trail2 = buildAuditPath(merkleTree2.tree[2], merkleTree2);
		expect(trail2.length).to.equal(2);
		expect(trail2[0].hash).to.equal(merkleTree2.tree[3]);
	});

	it('should return correctly', () => {
		const trail0 = buildAuditPath(merkleTree.tree[0], merkleTree);
		expect(trail0.length).to.equal(2);
		expect(trail0[0].hash).to.equal(merkleTree.tree[1]);
		const trail1 = buildAuditPath(merkleTree.tree[1], merkleTree);
		expect(trail1.length).to.equal(2);
		expect(trail1[0].hash).to.equal(merkleTree.tree[0]);
		const trail2 = buildAuditPath(merkleTree.tree[2], merkleTree);
		expect(trail2.length).to.equal(2);
		expect(trail2[0].hash).to.equal(merkleTree.tree[3]);
		const trail3 = buildAuditPath(merkleTree.tree[3], merkleTree);
		expect(trail3.length).to.equal(2);
		expect(trail3[0].hash).to.equal(merkleTree.tree[2]);
	});

	it('should return correctly for four-level tree', () => {
		const trail0 = buildAuditPath(merkleTreeLong.tree[0], merkleTreeLong);
		expect(trail0.length).to.equal(3);
		expect(trail0[0].hash).to.equal(merkleTreeLong.tree[1]);
		const trail1 = buildAuditPath(merkleTreeLong.tree[1], merkleTreeLong);
		expect(trail1.length).to.equal(3);
		expect(trail1[0].hash).to.equal(merkleTreeLong.tree[0]);
		const trail2 = buildAuditPath(merkleTreeLong.tree[2], merkleTreeLong);
		expect(trail2.length).to.equal(3);
		expect(trail2[0].hash).to.equal(merkleTreeLong.tree[3]);
		const trail3 = buildAuditPath(merkleTreeLong.tree[3], merkleTreeLong);
		expect(trail3.length).to.equal(3);
		expect(trail3[0].hash).to.equal(merkleTreeLong.tree[2]);
		const trail4 = buildAuditPath(merkleTreeLong.tree[4], merkleTreeLong);
		expect(trail4.length).to.equal(3);
		expect(trail4[0].hash).to.equal(merkleTreeLong.tree[5]);
		const trail5 = buildAuditPath(merkleTreeLong.tree[5], merkleTreeLong);
		expect(trail5.length).to.equal(3);
		expect(trail5[0].hash).to.equal(merkleTreeLong.tree[4]);
	});
});

describe('getRootHash function', () => {
	it('should return the last hash of the tree', () => {
		expect(getRootHash(merkleTree)).to.equal(merkleTree.tree[merkleTree.tree.length - 1]);
	});
});

describe('NodePositionEnum', () => {
	it('should be 1 for Left value', () => {
		expect(NodePositionEnum.Left).to.equal(1);
	});

	it('should be 2 for Right value', () => {
		expect(NodePositionEnum.Right).to.equal(2);
	});
});

describe('siblingOf function', () => {
	it('should return null if index invalid', () => {
		expect(siblingOf(-4)).to.equal(null);
		expect(siblingOf(-1)).to.equal(null);
	});

	it('should return valid value if first index', () => {
		expect(siblingOf(0).index).to.equal(1);
	});

	it('should return valid values on first level nodes', () => {
		const expectedResult1 = {
			position: NodePositionEnum.Left,
			index: 0
		};
		expect(siblingOf(1)).to.deep.equal(expectedResult1);
		const expectedResult2 = {
			position: NodePositionEnum.Right,
			index: 3
		};
		expect(siblingOf(2)).to.deep.equal(expectedResult2);
	});

	it('should return valid values on deeper level nodes', () => {
		const expectedResult1 = {
			position: NodePositionEnum.Left,
			index: 12
		};
		expect(siblingOf(13)).to.deep.equal(expectedResult1);
		const expectedResult2 = {
			position: NodePositionEnum.Right,
			index: 15
		};
		expect(siblingOf(14)).to.deep.equal(expectedResult2);
	});
});

describe('evenify', () => {
	it('should return 0 for 0', () => {
		expect(NodePositionEnum.Left).to.equal(1);
	});

	it('should return 2 for 1', () => {
		expect(NodePositionEnum.Right).to.equal(2);
	});

	it('should return 2 for 2', () => {
		expect(NodePositionEnum.Right).to.equal(2);
	});

	it('should return 4 for 3', () => {
		expect(NodePositionEnum.Right).to.equal(2);
	});

	it('should return 14 for 14', () => {
		expect(NodePositionEnum.Right).to.equal(2);
	});

	it('should return 14 for 13', () => {
		expect(NodePositionEnum.Right).to.equal(2);
	});
});
