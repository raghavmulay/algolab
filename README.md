# AlgoLab: Comprehensive Algorithm Visualizer

AlgoLab is a high-performance, interactive algorithm visualization platform designed to help students and developers understand complex data structures and algorithms through live execution traces, synchronized code highlighting, and AI-powered explanations.

## 🚀 Key Features

- **Live Execution Trace**: 1:1 parity between algorithm logic and displayed code strings. Watch algorithms step through source code in real-time.
- **21+ Algorithm Modules**: Coverage of Sorting, Searching, Graphs, Trees, Dynamic Programming, and String Matching.
- **Interactive Data Structures**: Visualize complex operations on AVL Trees, Red-Black Trees, Heaps, and Segment Trees.
- **AI-Powered Explanations**: Integrated with Groq SDK to provide intelligent insights into execution steps.
- **Modern UI/UX**: Built with React 19, Tailwind CSS 4, and Framer Motion for smooth, premium animations.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks & Generator-based frame management

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Engine**: Groq SDK (Llama-3 based explanations)
- **Environment**: Dotenv for configuration

## 📂 Project Structure

```text
algolab/
├── client/                # React Vite Frontend
│   ├── src/
│   │   ├── algorithms/    # Core algorithm generator logic
│   │   ├── components/    # Reusable UI components (CodePanel, Visualizers)
│   │   ├── hooks/         # Algorithm-specific state hooks
│   │   └── pages/         # High-level views (Home, Category-specific)
│   └── package.json
└── server/                # Express Backend
    ├── routes/            # AI and API endpoints
    ├── server.js          # Entry point
    └── package.json
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
# Create a .env file with:
# PORT=5000
# GROQ_API_KEY=your_api_key_here
npm start
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📜 Audit & Execution Trace Mapping

AlgoLab uses a systematic mapping system for its execution traces. Each algorithm is implemented as a **Generator Function** that yields visualization frames. These frames contain an `activeLine` property that maps precisely to a corresponding code string displayed in the UI.

### Example Mapping Pattern:
```javascript
// Generator yielding a specific line
yield {
  activeLine: 8, // Maps to the 8th line of the displayed pseudocode/source
  message: "Processing node...",
  // state data...
};
```

## 🗺️ Roadmap & Supported Algorithms

- [x] **Sorting**: Bubble, Quick, Merge, Heap
- [x] **Searching**: Binary Search
- [x] **Graph**: Dijkstra, Bellman-Ford, Kruskal, Prim, Topological Sort
- [x] **Trees**: BST (Insert, Search, Delete, Traversals), AVL, Red-Black Tree, Segment Tree
- [x] **Strings**: KMP, Trie
- [x] **DP**: LCS, LIS, MCM
- [ ] **Geometry**: Graham Scan, Jarvis March (Coming Soon)

## 📄 License

This project is licensed under the MIT License.
