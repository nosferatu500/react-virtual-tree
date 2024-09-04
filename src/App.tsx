import { useState } from "react";
import "./App.css";
import { TNode } from "./TreeNode";
import { VTree } from "./VTree";

const initialTreeData: TNode<CustomData>[] = [
    {
        id: "root",
        name: "root",
        type: "folder",
        parent: null,
        children: [
            {
                id: "1",
                name: "src",
                type: "folder",
                parent: "root",
                children: [
                    { id: "1.1", name: "index.js", type: "file", parent: "1", children: [] },
                    { id: "1.2", name: "App.js", type: "file", parent: "1", children: [] },
                    { id: "1.3", name: "main.jsx", type: "file", parent: "1", children: [] },
                    {
                        id: "1.4",
                        name: "components",
                        type: "folder",
                        parent: "1",
                        children: [
                            { id: "1.4.1", name: "Header.js", type: "file", parent: "1.4", children: [] },
                            { id: "1.4.2", name: "Footer.js", type: "file", parent: "1.4", children: [] },
                        ],
                    },
                ],
                data: { ownData: "root" },
            },
            {
                id: "2",
                name: "stories",
                type: "folder",
                parent: "root",
                children: [
                    { id: "2.1", name: "button.css", type: "file", parent: "2", children: [] },
                    { id: "2.2", name: "Button.stories.ts", type: "file", parent: "2", children: [] },
                    { id: "2.3", name: "Button.tsx", type: "file", parent: "2", children: [] },
                    { id: "2.4", name: "Configure.mdx", type: "file", parent: "2", children: [] },
                ],
                data: { ownData: "root" },
            },
            { id: "3", name: "package.json", type: "file", parent: "root", children: [], data: { ownData: "root" } },
        ],
        data: { ownData: null },
    },
];

interface CustomData {
    ownData: string | null;
}

function App() {
    const [treeData, setTreeData] = useState<TNode<CustomData>[]>(initialTreeData);
    const [selectedNodes, setSelectedNodes] = useState<TNode<CustomData>[]>([]); // State in parent to keep selected nodes

  // Callback to handle selection change from VTree
  const handleSelectionChange = (nodes: TNode<CustomData>[]) => {
    setSelectedNodes(nodes);
  };

    const handleCanDrop = (dragSource: TNode, dropTarget: TNode) => {
        if (dragSource.parent === dropTarget.parent) return false;

        return true;
    };

    const handleCanDrag = (dragSource: TNode) => {
        if (dragSource.type === "folder") return false;

        return true;
    };

    const handleOnDrop = (draggedNodes: TNode<CustomData>[], dropTarget: TNode<CustomData>) => {
        console.warn("DO SOMETHING!!!");
        console.log(draggedNodes);
        console.log(dropTarget);
    };

    const handleOnClick = () => {
        console.log("Click!")
    }

    console.log({selectedNodes})

    return (
        <>
            <h1>React Virtual Tree</h1>
            <div className="card">
                <VTree
                    openAll
                    data={treeData}
                    setData={setTreeData}
                    onClick={handleOnClick}
                    canDrag={handleCanDrag}
                    canDrop={handleCanDrop}
                    onDrop={handleOnDrop}
                    onSelectionChange={handleSelectionChange}
                />
            </div>
        </>
    );
}

export default App;
