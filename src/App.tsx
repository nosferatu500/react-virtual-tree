import { useState } from 'react';
import './App.css'
import { TNode } from './TreeNode';
import VTree from './VTree';

const initialTreeData: TNode[] = [
  {
    id: "1",
    name: 'src',
    type: 'folder',
    children: [
      { id: "1.1", name: 'index.js', type: 'file', children: [] },
      { id: "1.2", name: 'App.js', type: 'file', children: [] },
      {
        id: "1.3",
        name: 'components',
        type: 'folder',
        children: [
          { id: "1.3.1", name: 'Header.js', type: 'file', children: [] },
          { id: "1.3.2", name: 'Footer.js', type: 'file', children: [] },
        ],
      },
    ],
  },
  { id: "2", name: 'package.json', type: 'file', children: [] },
];


function App() {
  const [treeData, setTreeData] = useState(initialTreeData);

  return (
    <>
      <div>
      </div>
      <h1>React Virtual Tree</h1>
      <div className="card">
        <VTree data={treeData} setData={setTreeData} />
      </div>
    </>
  )
}

export default App
