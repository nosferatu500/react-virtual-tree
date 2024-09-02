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
                        data: { owner: "" }
                    },
                ],
                data: { owner: "" }
            },
            { id: "2", name: "package.json", type: "file", children: [], data: { owner: "" } },
        ],
        data: { owner: "" }
    },
];

interface CustomData {
    owner: string
}

function App() {
    const [treeData, setTreeData] = useState<TNode<CustomData>[]>(initialTreeData);
    const [selectedNodes, setSelectedNodes] = useState<React.Key[]>([]);

    const onClickNode = (event: React.MouseEvent, nodeId: React.Key) => {
        if (event.metaKey || event.ctrlKey) {
            setSelectedNodes((prevSelected) =>
                prevSelected.includes(nodeId) ? prevSelected.filter((id) => id !== nodeId) : [...prevSelected, nodeId]
            );

            return;
        }

        setSelectedNodes([nodeId]);
    };

    return (
        <>
            <h1>React Virtual Tree</h1>
            <div className="card">
                <VTree
                    openAll
                    data={treeData}
                    setData={setTreeData}
                    selectedNodes={selectedNodes}
                    onClickNode={onClickNode}
                />
            </div>
        </>
    );
}

export default App;
