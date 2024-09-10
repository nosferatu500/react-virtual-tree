import { useState } from "react";
import "./App.css";
import { TNode } from "./TreeNode";
import { VTree } from "./VTree";

const initialTreeData: TNode<CustomData>[] = [
    {
        id: "root",
        name: "root",
        isFolder: true,
        parent: null,
        children: [
            {
                id: "1",
                name: "src",
                isFolder: true,
                parent: "root",
                children: [
                    { id: "1.1", name: "index.js", isFolder: false, parent: "1", children: [] },
                    { id: "1.2", name: "App.js", isFolder: false, parent: "1", children: [] },
                    { id: "1.3", name: "main.jsx", isFolder: false, parent: "1", children: [] },
                    {
                        id: "1.4",
                        name: "components",
                        isFolder: true,
                        parent: "1",
                        children: [
                            { id: "1.4.1", name: "Header.js", isFolder: false, parent: "1.4", children: [] },
                            { id: "1.4.2", name: "Footer.js", isFolder: false, parent: "1.4", children: [] },
                        ],
                    },
                ],
                data: { ownData: "root" },
            },
            {
                id: "2",
                name: "stories",
                isFolder: true,
                parent: "root",
                children: [
                    { id: "2.1", name: "button.css", isFolder: false, parent: "2", children: [] },
                    { id: "2.2", name: "Button.stories.ts", isFolder: false, parent: "2", children: [] },
                    { id: "2.3", name: "Button.tsx", isFolder: false, parent: "2", children: [] },
                    { id: "2.4", name: "Configure.mdx", isFolder: false, parent: "2", children: [] },
                ],
                data: { ownData: "root" },
            },
            { id: "3", name: "package.json", isFolder: false, parent: "root", children: [], data: { ownData: "root" } },
        ],
        data: { ownData: null },
    },
];

interface CustomData {
    ownData: string | null;
}

const renderNode = (text: string): React.ReactNode => {
    return <span style={{ color: "red" }}>{text}</span>;
};

function App() {
    const [treeData, setTreeData] = useState<TNode<CustomData>[]>(initialTreeData);
    const [selectedNodes, setSelectedNodes] = useState<TNode<CustomData>[]>([]);

    const [searchTerm, setSearchTerm] = useState("");

    // Callback to handle selection change from VTree
    const handleSelectionChange = (nodes: TNode<CustomData>[]) => {
        console.log({ nodes });
        setSelectedNodes(nodes);
    };

    const handleCanDrop = (draggedNodes: TNode<CustomData>[], dropTarget: TNode<CustomData>) => {
        // Prevent re-order
        if (
            draggedNodes.some(
                (dragSource) => dragSource.parent === dropTarget.parent || dragSource.parent === dropTarget.id
            )
        ) {
            return false;
        }

        return true;
    };

    const handleCanDrag = (dragSource: TNode<CustomData>) => {
        if (dragSource.isFolder) return false;

        return true;
    };

    const handleOnDrop = (draggedNodes: TNode<CustomData>[], dropTarget: TNode<CustomData>) => {
        console.warn("DO SOMETHING!!!");
        console.log(draggedNodes);
        console.log(dropTarget);
    };

    const handleOnClick = () => {
        console.log({ selectedNodes });
    };

    const filterTree = (nodes: TNode<CustomData>[], term: string): TNode<CustomData>[] => {
        if (!term) return nodes;

        // Filter nodes that match the search term or have children that match
        return nodes
            .map((node) => {
                const children = filterTree(node.children, term); // Recursively filter children
                if (node.name.toLowerCase().includes(term.toLowerCase()) || children.length > 0) {
                    return { ...node, children }; // Include matching nodes or parents of matches
                }
                return null;
            })
            .filter(Boolean) as TNode<CustomData>[]; // Remove null values
    };

    return (
        <>
            <h1>React Virtual Tree</h1>
            <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="card">
                <VTree
                    dataSetName="example_data_set"
                    fileExplorerMode={false}
                    openAll={searchTerm !== ""}
                    data={filterTree(treeData, searchTerm)}
                    setData={setTreeData}
                    onClick={handleOnClick}
                    canDrag={handleCanDrag}
                    canDrop={handleCanDrop}
                    onDrop={handleOnDrop}
                    onSelectionChange={handleSelectionChange}
                    renderNode={renderNode}
                />
            </div>
            <div>Selected: {selectedNodes[0]?.name}</div>
        </>
    );
}

export default App;
