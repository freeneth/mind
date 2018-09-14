import './src/treeStore_test.js';
import callbacks1 from './src/indexMindMap.jsx';
import callbacks2 from './src/indexShareMind.jsx'
import init from './src/main.jsx';
import { initShareMind } from './src/main.jsx';
initShareMind(document.getElementById('root'), callbacks2)
init(document.getElementById('root'), callbacks1);
