/**
 * KMP Algorithm (Knuth-Morris-Pratt)
 * Efficient string matching using a Longest Prefix Suffix (LPS) array.
 */

export function* kmp(text, pattern) {
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return;

  const lps = new Array(m).fill(0);

  // Phase 1: Compute LPS array
  yield {
    phase: 'lps-start',
    message: 'Phase 1: Computing LPS (Longest Prefix Suffix) array...',
    lps: [...lps],
    activeLine: 4,
  };

  let len = 0;
  let i = 1;
  while (i < m) {
    yield {
      phase: 'lps-comparing',
      message: `LPS: Comparing pattern[${i}]('${pattern[i]}') with pattern[${len}]('${pattern[len]}')`,
      lps: [...lps],
      i, len,
      activeLine: 7,
    };

    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      yield {
        phase: 'lps-match',
        message: `LPS: Match! pattern[${i}] == pattern[${len - 1}]. lps[${i}] = ${len}`,
        lps: [...lps],
        i, len,
        activeLine: 8,
      };
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
        yield {
          phase: 'lps-mismatch-backtrack',
          message: `LPS: Mismatch. Backtracking len to lps[${len}]`,
          lps: [...lps],
          i, len,
          activeLine: 10,
        };
      } else {
        lps[i] = 0;
        yield {
          phase: 'lps-mismatch-zero',
          message: `LPS: Mismatch and len is 0. lps[${i}] = 0`,
          lps: [...lps],
          i, len,
          activeLine: 11,
        };
        i++;
      }
    }
  }

  yield {
    phase: 'lps-done',
    message: `LPS array computed: [${lps.join(', ')}]. Starting search...`,
    lps: [...lps],
    activeLine: 19,
  };

  // Phase 2: Search
  let txtIdx = 0;
  let patIdx = 0;
  const matches = [];

  while (txtIdx < n) {
    yield {
      phase: 'searching',
      message: `Search: Comparing text[${txtIdx}]('${text[txtIdx]}') with pattern[${patIdx}]('${pattern[patIdx]}')`,
      lps, txtIdx, patIdx, matches: [...matches],
      activeLine: 23,
    };

    if (pattern[patIdx] === text[txtIdx]) {
      txtIdx++;
      patIdx++;

      if (patIdx === m) {
        matches.push(txtIdx - patIdx);
        yield {
          phase: 'match-found',
          message: `🎯 Pattern found at index ${txtIdx - patIdx}!`,
          lps, txtIdx, patIdx, matches: [...matches],
          activeLine: 27,
        };
        patIdx = lps[patIdx - 1];
      }
    } else {
      if (patIdx !== 0) {
        patIdx = lps[patIdx - 1];
        yield {
          phase: 'search-mismatch-backtrack',
          message: `Search: Mismatch. Backtracking pattern index to lps[${patIdx}]`,
          lps, txtIdx, patIdx, matches: [...matches],
          activeLine: 30,
        };
      } else {
        txtIdx++;
        yield {
          phase: 'search-mismatch-next',
          message: `Search: Mismatch and patIdx is 0. Moving to next text character.`,
          lps, txtIdx, patIdx, matches: [...matches],
          activeLine: 31,
        };
      }
    }
  }

  yield {
    phase: 'done',
    message: matches.length > 0 ? `Search complete. Found ${matches.length} match(es) at: ${matches.join(', ')}` : "Search complete. No matches found.",
    lps, matches: [...matches],
    activeLine: 34,
  };
}

export const kmpInfo = {
  name: "KMP Algorithm",
  description: "The Knuth-Morris-Pratt algorithm searches for occurrences of a pattern within a main text string by using information from previous comparisons to skip unnecessary alignments.",
  timeComplexity: "O(n + m)",
  spaceComplexity: "O(m)",
};

export const kmpCode = `function computeLPS(pattern) {
  const m = pattern.length;
  const lps = Array(m).fill(0);
  let len = 0, i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else {
      if (len !== 0) len = lps[len - 1];
      else lps[i++] = 0;
    }
  }
  return lps;
}

function KMPSearch(text, pattern) {
  const n = text.length, m = pattern.length;
  const lps = computeLPS(pattern);
  let i = 0, j = 0;

  while (i < n) {
    if (pattern[j] === text[i]) {
      i++; j++;
    }
    if (j === m) {
      console.log("Found pattern at " + (i - j));
      j = lps[j - 1];
    } else if (i < n && pattern[j] !== text[i]) {
      if (j !== 0) j = lps[j - 1];
      else i++;
    }
  }
}`;
