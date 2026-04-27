/**
 * Disjoint Set Union (DSU) / Union-Find Logic
 */

export function* dsuFind(parent, i) {
    yield {
        phase: 'find-start',
        message: `Finding root of node ${i}`,
        currentNode: i,
        activeLine: 8,
    };

    if (parent[i] === i) {
        yield {
            phase: 'find-at-root',
            message: `Node ${i} is its own root.`,
            currentNode: i,
            activeLine: 8,
        };
        return i;
    }

    yield {
        phase: 'find-recursive',
        message: `Node ${i} points to ${parent[i]}. Searching higher...`,
        currentNode: i,
        activeLine: 10,
    };

    // Path compression - we return the root, but in the hook we'll update parent
    const root = yield* dsuFind(parent, parent[i]);

    if (parent[i] !== root) {
        yield {
            phase: 'path-compression',
            message: `Path compression: Setting parent of ${i} directly to root ${root}`,
            currentNode: i,
            root,
            activeLine: 10,
        };
    }

    return root;
}

export function* dsuUnion(parent, rank, i, j) {
    yield {
        phase: 'union-start',
        message: `Uniting sets of ${i} and ${j}`,
        nodes: [i, j],
        activeLine: 14,
    };

    const rootI = yield* dsuFind(parent, i);
    const rootJ = yield* dsuFind(parent, j);

    if (rootI === rootJ) {
        yield {
            phase: 'union-already-joined',
            message: `${i} and ${j} are already in the same set (Root=${rootI}).`,
            nodes: [i, j],
            root: rootI,
            activeLine: 17,
        };
        return;
    }

    yield {
        phase: 'union-merging',
        message: `Roots found: ${rootI} and ${rootJ}. Merging by rank...`,
        roots: [rootI, rootJ],
        activeLine: 19,
    };

    if (rank[rootI] < rank[rootJ]) {
        parent[rootI] = rootJ;
        yield {
            phase: 'union-merged',
            message: `Rank of ${rootI} < ${rootJ}. Attached ${rootI} to ${rootJ}.`,
            parent: [...parent],
            activeLine: 20,
        };
    } else if (rank[rootI] > rank[rootJ]) {
        parent[rootJ] = rootI;
        yield {
            phase: 'union-merged',
            message: `Rank of ${rootJ} < ${rootI}. Attached ${rootJ} to ${rootI}.`,
            parent: [...parent],
            activeLine: 22,
        };
    } else {
        parent[rootJ] = rootI;
        rank[rootI]++;
        yield {
            phase: 'union-merged-rank-up',
            message: `Ranks equal. Attached ${rootJ} to ${rootI} and incremented rank of ${rootI}.`,
            parent: [...parent],
            rank: [...rank],
            activeLine: 24,
        };
    }
}

export const dsuInfo = {
    name: "Union-Find (DSU)",
    description: "Disjoint Set Union (DSU) maintains a partition of elements into disjoint sets. It supports two main operations: Find (determine which set an element belongs to) and Union (merge two sets). With path compression and union by rank, both operations take nearly constant time.",
    timeComplexity: "O(α(n)) where α is Inverse Ackermann",
    spaceComplexity: "O(n)",
};

export const dsuCode = `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(i) {
    if (this.parent[i] === i) return i;
    // Path compression
    return this.parent[i] = this.find(this.parent[i]);
  }

  union(i, j) {
    let rootI = this.find(i);
    let rootJ = this.find(j);

    if (rootI !== rootJ) {
      // Union by rank
      if (this.rank[rootI] < this.rank[rootJ]) {
        this.parent[rootI] = rootJ;
      } else if (this.rank[rootI] > this.rank[rootJ]) {
        this.parent[rootJ] = rootI;
      } else {
        this.parent[rootJ] = rootI;
        this.rank[rootI]++;
      }
    }
  }
}`;
