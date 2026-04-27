// ─── Segment Tree — generator-based animation ────────────────────────────────

function mkFrame(tree, arr, opts = {}) {
  return {
    tree: [...tree],
    arr: [...arr],
    n: arr.length,
    highlightedNodes: [],
    activeRange: null,
    queryRange: null,
    resultNode: null,
    phase: 'idle',
    message: '',
    activeLine: 1,
    ...opts,
  };
}

// ─── Build ────────────────────────────────────────────────────────────────────

export function* segTreeBuild(inputArr) {
  const arr = [...inputArr];
  const n = arr.length;
  const size = 4 * n;
  const tree = Array(size).fill(0);

  yield mkFrame(tree, arr, {
    phase: 'start',
    message: `Building Segment Tree for array of size ${n}`,
    activeLine: 1,
  });

  function* build(node, start, end) {
    yield mkFrame(tree, arr, {
      highlightedNodes: [node],
      activeRange: [start, end],
      phase: 'building',
      message: `Node ${node}: covering range [${start}, ${end}]`,
      activeLine: 1,
    });

    if (start === end) {
      tree[node] = arr[start];
      yield mkFrame(tree, arr, {
        highlightedNodes: [node],
        activeRange: [start, end],
        phase: 'leaf',
        message: `Leaf node ${node}: tree[${node}] = arr[${start}] = ${arr[start]}`,
        activeLine: 3,
      });
      return;
    }

    const mid = Math.floor((start + end) / 2);
    yield* build(2 * node, start, mid);
    yield* build(2 * node + 1, mid + 1, end);

    tree[node] = tree[2 * node] + tree[2 * node + 1];
    yield mkFrame(tree, arr, {
      highlightedNodes: [node, 2 * node, 2 * node + 1],
      activeRange: [start, end],
      phase: 'merge',
      message: `Node ${node} [${start},${end}]: tree[${node}] = ${tree[2 * node]} + ${tree[2 * node + 1]} = ${tree[node]}`,
      activeLine: 10,
    });
  }

  yield* build(1, 0, n - 1);

  yield mkFrame(tree, arr, {
    highlightedNodes: [1],
    phase: 'done',
    message: `✓ Segment Tree built! Root = ${tree[1]} (total sum)`,
    activeLine: 10,
  });

  return { tree, arr };
}

// ─── Range Sum Query ──────────────────────────────────────────────────────────

export function* segTreeQuery(tree, arr, qL, qR) {
  const n = arr.length;
  const treeCopy = [...tree];

  yield mkFrame(treeCopy, arr, {
    queryRange: [qL, qR],
    phase: 'start',
    message: `Query: sum of range [${qL}, ${qR}]`,
    activeLine: 1,
  });

  function* query(node, start, end) {
    yield mkFrame(treeCopy, arr, {
      highlightedNodes: [node],
      activeRange: [start, end],
      queryRange: [qL, qR],
      phase: 'querying',
      message: `Node ${node} [${start},${end}]: checking overlap with query [${qL},${qR}]`,
      activeLine: 2,
    });

    if (qR < start || end < qL) {
      yield mkFrame(treeCopy, arr, {
        highlightedNodes: [node],
        activeRange: [start, end],
        queryRange: [qL, qR],
        phase: 'no_overlap',
        message: `Node ${node} [${start},${end}]: No overlap → return 0`,
        activeLine: 3,
      });
      return 0;
    }

    if (qL <= start && end <= qR) {
      yield mkFrame(treeCopy, arr, {
        highlightedNodes: [node],
        activeRange: [start, end],
        queryRange: [qL, qR],
        phase: 'full_overlap',
        message: `Node ${node} [${start},${end}]: Full overlap → return ${treeCopy[node]}`,
        activeLine: 5,
      });
      return treeCopy[node];
    }

    const mid = Math.floor((start + end) / 2);
    yield mkFrame(treeCopy, arr, {
      highlightedNodes: [node, 2 * node, 2 * node + 1],
      activeRange: [start, end],
      queryRange: [qL, qR],
      phase: 'partial_overlap',
      message: `Node ${node} [${start},${end}]: Partial overlap → split at mid=${mid}`,
      activeLine: 6,
    });

    const left = yield* query(2 * node, start, mid);
    const right = yield* query(2 * node + 1, mid + 1, end);
    const result = left + right;

    yield mkFrame(treeCopy, arr, {
      highlightedNodes: [node],
      activeRange: [start, end],
      queryRange: [qL, qR],
      resultNode: node,
      phase: 'combining',
      message: `Node ${node}: combining ${left} + ${right} = ${result}`,
      activeLine: 8,
    });

    return result;
  }

  const result = yield* query(1, 0, n - 1);

  yield mkFrame(treeCopy, arr, {
    highlightedNodes: [1],
    queryRange: [qL, qR],
    resultNode: 1,
    phase: 'done',
    message: `✓ Sum of arr[${qL}..${qR}] = ${result}`,
    activeLine: 8,
    queryResult: result,
  });

  return { tree: treeCopy, arr };
}

// ─── Point Update ─────────────────────────────────────────────────────────────

export function* segTreeUpdate(tree, arr, idx, newVal) {
  const n = arr.length;
  const treeCopy = [...tree];
  const arrCopy = [...arr];
  const oldVal = arrCopy[idx];

  yield mkFrame(treeCopy, arrCopy, {
    highlightedNodes: [],
    phase: 'start',
    message: `Update: arr[${idx}] = ${oldVal} → ${newVal}`,
    activeLine: 1,
  });

  arrCopy[idx] = newVal;

  function* update(node, start, end) {
    yield mkFrame(treeCopy, arrCopy, {
      highlightedNodes: [node],
      activeRange: [start, end],
      phase: 'updating',
      message: `Node ${node} [${start},${end}]: traversing to index ${idx}`,
      activeLine: 2,
    });

    if (start === end) {
      treeCopy[node] = newVal;
      yield mkFrame(treeCopy, arrCopy, {
        highlightedNodes: [node],
        activeRange: [start, end],
        phase: 'leaf_update',
        message: `Leaf node ${node}: updated to ${newVal}`,
        activeLine: 4,
      });
      return;
    }

    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) {
      yield mkFrame(treeCopy, arrCopy, {
        highlightedNodes: [node, 2 * node],
        activeRange: [start, end],
        phase: 'updating',
        message: `idx=${idx} ≤ mid=${mid} → go left to node ${2 * node}`,
        activeLine: 9,
      });
      yield* update(2 * node, start, mid);
    } else {
      yield mkFrame(treeCopy, arrCopy, {
        highlightedNodes: [node, 2 * node + 1],
        activeRange: [start, end],
        phase: 'updating',
        message: `idx=${idx} > mid=${mid} → go right to node ${2 * node + 1}`,
        activeLine: 11,
      });
      yield* update(2 * node + 1, mid + 1, end);
    }

    treeCopy[node] = treeCopy[2 * node] + treeCopy[2 * node + 1];
    yield mkFrame(treeCopy, arrCopy, {
      highlightedNodes: [node, 2 * node, 2 * node + 1],
      activeRange: [start, end],
      phase: 'recalculate',
      message: `Node ${node} [${start},${end}]: recalculated = ${treeCopy[2 * node]} + ${treeCopy[2 * node + 1]} = ${treeCopy[node]}`,
      activeLine: 13,
    });
  }

  yield* update(1, 0, n - 1);

  yield mkFrame(treeCopy, arrCopy, {
    highlightedNodes: [1],
    phase: 'done',
    message: `✓ Update complete! arr[${idx}] = ${newVal}, new root sum = ${treeCopy[1]}`,
    activeLine: 13,
    queryResult: null,
  });

  return { tree: treeCopy, arr: arrCopy };
}

// ─── Build tree synchronously (no animation) ─────────────────────────────────

export function buildSegTreeSync(arr) {
  const n = arr.length;
  const tree = Array(4 * n).fill(0);
  function build(node, start, end) {
    if (start === end) { tree[node] = arr[start]; return; }
    const mid = Math.floor((start + end) / 2);
    build(2 * node, start, mid);
    build(2 * node + 1, mid + 1, end);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
  build(1, 0, n - 1);
  return tree;
}

// ─── Info & Code ──────────────────────────────────────────────────────────────

export const segTreeInfo = {
  name: 'Segment Tree',
  timeComplexity: 'O(n) build, O(log n) query/update',
  spaceComplexity: 'O(n)',
};

export const segTreeBuildCode = `function build(node, start, end) {
  if (start === end) {
    tree[node] = arr[start];
    return;
  }
  const mid = (start + end) >> 1;
  build(2*node,   start, mid);
  build(2*node+1, mid+1, end);
  // merge children
  tree[node] = tree[2*node] + tree[2*node+1];
}
// Call: build(1, 0, n-1)`;

export const segTreeQueryCode = `function query(node, start, end, l, r) {
  if (r < start || end < l)
    return 0;           // no overlap
  if (l <= start && end <= r)
    return tree[node];  // full overlap
  const mid = (start + end) >> 1;
  return query(2*node,   start, mid, l, r)
       + query(2*node+1, mid+1, end, l, r);
}
// Call: query(1, 0, n-1, l, r)`;

export const segTreeUpdateCode = `function update(node, start, end, idx, val) {
  if (start === end) {
    arr[idx] = val;
    tree[node] = val;
    return;
  }
  const mid = (start + end) >> 1;
  if (idx <= mid)
    update(2*node,   start, mid,   idx, val);
  else
    update(2*node+1, mid+1, end,   idx, val);
  // recalculate parent
  tree[node] = tree[2*node] + tree[2*node+1];
}
// Call: update(1, 0, n-1, idx, val)`;

export const segTreeCodeMap = {
  segTreeBuild: segTreeBuildCode,
  segTreeQuery: segTreeQueryCode,
  segTreeUpdate: segTreeUpdateCode,
};
