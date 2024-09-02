import { useState } from "react";
import "./App.css";
import { TNode } from "./TreeNode";
import { VTree } from "./VTree";

const initialTreeData: TNode<CustomData>[] = [
    {
        id: "root",
        name: "root",
        type: "folder",
        children: [
            {
                id: "1",
                name: "src",
                type: "folder",
                children: [
                    { id: "1.1", name: "index.js", type: "file", children: [] },
                    { id: "1.2", name: "App.js", type: "file", children: [] },
                    {
                        id: "1.3",
                        name: "components",
                        type: "folder",
                        children: [
                            { id: "1.3.1", name: "Header.js", type: "file", children: [] },
                            { id: "1.3.2", name: "Footer.js", type: "file", children: [] },
                        ],
                        data: { owner: "" },
                    },
                ],
                data: { owner: "" },
            },
            { id: "2", name: "package.json", type: "file", children: [], data: { owner: "" } },
        ],
        data: { owner: "" },
    },
];

interface CustomData {
    owner: string;
}

function App() {
    const [treeData, setTreeData] = useState<TNode<CustomData>[]>(initialTreeData);
    const [selectedNodeIds, setSelectedNodeIds] = useState<React.Key[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<TNode<CustomData>[]>([]);

    const onClickNode = (event: React.MouseEvent, node: TNode<CustomData>) => {
        if (event.metaKey || event.ctrlKey) {
            setSelectedNodeIds((prevSelected) =>
                prevSelected.includes(node.id)
                    ? prevSelected.filter((id) => id !== node.id)
                    : [...prevSelected, node.id]
            );

            setSelectedNodes((prevSelected) =>
                prevSelected.find((prevNode) => prevNode.id === node.id)
                    ? prevSelected.filter((prevNode) => prevNode.id !== node.id)
                    : [...prevSelected, node]
            );

            return;
        }

        setSelectedNodeIds([node.id]);
        setSelectedNodes([node]);
    };

    const handleCanDrop = (dragSource: TNode, dropTarget: TNode) => {
        if (dragSource.id === dropTarget.id) return false;

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

    return (
        <>
            <h1>React Virtual Tree</h1>
            <div className="card">
                <VTree
                    openAll
                    data={treeData}
                    setData={setTreeData}
                    selectedNodeIds={selectedNodeIds}
                    selectedNodes={selectedNodes}
                    onClickNode={onClickNode}
                    canDrag={handleCanDrag}
                    canDrop={handleCanDrop}
                    onDrop={handleOnDrop}
                />
            </div>
        </>
    );
}

export default App;
