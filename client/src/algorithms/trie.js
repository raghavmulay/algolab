/**
 * Trie (Prefix Tree) Logic
 */

export class TrieNode {
  constructor(char = '') {
    this.char = char;
    this.children = {};
    this.isEndOfWord = false;
    this.id = Math.random().toString(36).substr(2, 9); // For React keys
  }
}

export function* trieInsert(root, word) {
  let node = root;
  yield {
    phase: 'insert-start',
    message: `Inserting word: "${word}"`,
    currentNodeId: node.id,
    activeLine: 14,
  };

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    yield {
      phase: 'insert-char',
      message: `Moving to character: '${char}'`,
      currentNodeId: node.id,
      charIndex: i,
      activeLine: 15,
    };

    if (!node.children[char]) {
      node.children[char] = new TrieNode(char);
      yield {
        phase: 'insert-new-node',
        message: `Character '${char}' not found. Creating new node.`,
        currentNodeId: node.children[char].id,
        charIndex: i,
        activeLine: 17,
      };
    }
    node = node.children[char];
  }

  node.isEndOfWord = true;
  yield {
    phase: 'insert-done',
    message: `Successfully inserted "${word}". Marked as end of word.`,
    currentNodeId: node.id,
    activeLine: 21,
  };
}

export function* trieSearch(root, word) {
  let node = root;
  yield {
    phase: 'search-start',
    message: `Searching for word: "${word}"`,
    currentNodeId: node.id,
    activeLine: 25,
  };

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    yield {
      phase: 'search-char',
      message: `Looking for character: '${char}'`,
      currentNodeId: node.id,
      charIndex: i,
      activeLine: 26,
    };

    if (!node.children[char]) {
      yield {
        phase: 'search-fail',
        message: `Character '${char}' not found. Word "${word}" does not exist.`,
        currentNodeId: null,
        activeLine: 27,
      };
      return false;
    }
    node = node.children[char];
  }

  const found = node.isEndOfWord;
  yield {
    phase: 'search-done',
    message: found
      ? `🎯 Found exact word "${word}"!`
      : `Word "${word}" exists as a prefix but not as a full word.`,
    currentNodeId: node.id,
    found,
    activeLine: 30,
  };
  return found;
}

export const trieInfo = {
  name: "Trie (Prefix Tree)",
  description: "A Trie is a tree-like data structure used for efficient retrieval of keys in a large dataset of strings. It is commonly used for autocomplete and spell-check features.",
  timeComplexity: "O(m) where m is length of word",
  spaceComplexity: "O(ALPHABET_SIZE * m * n)",
};

export const trieCode = `class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  search(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }
}`;
