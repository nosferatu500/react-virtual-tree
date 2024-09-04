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
    const [selectedNodeIds, setSelectedNodeIds] = useState<React.Key[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<TNode<CustomData>[]>([]);

    const [lastSelectedNode, setLastSelectedNode] = useState<TNode<CustomData> | null>(null);

    function flattenTree<T>(nodes: TNode<T>[], result: TNode<T>[] = []): TNode<T>[] {
        nodes.forEach((node) => {
            result.push(node);
            flattenTree(node.children, result);
        });
        return result;
    }

    const flatTree = flattenTree(initialTreeData);

    function getAllDescendantIds<T>(node: TNode<T>): React.Key[] {
        let ids: React.Key[] = [];
        node.children.forEach((child) => {
            ids.push(child.id);
            ids = ids.concat(getAllDescendantIds(child));
        });
        return ids;
    }

    const onClickNode = (event: React.MouseEvent, node: TNode<CustomData>) => {
        if (event.metaKey || event.ctrlKey) {

            let result: TNode<CustomData>[]

            // Check if the node is already selected
            const isSelected = selectedNodes.some((selectedNode) => selectedNode.id === node.id);

            if (isSelected) {
                // Deselect the node if it was already selected
                result = selectedNodes.filter((selectedNode) => selectedNode.id !== node.id);
            } else {
                // Add the clicked node to the selection
                const updatedSelected = [...selectedNodes, node];

                // Get all descendant IDs of the clicked node
                const descendants = getAllDescendantIds(node);

                // Filter out the descendants from the updated selection
                result = updatedSelected.filter((selectedNode) => !descendants.includes(selectedNode.id));
            }

            setSelectedNodeIds(result.map((item) => item.id));
            setSelectedNodes(result);

            return;
        }

        if (event.shiftKey && lastSelectedNode) {
            // If Shift is pressed, select a range of nodes
            const startIndex = flatTree.findIndex((n) => n.id === lastSelectedNode.id);
            const endIndex = flatTree.findIndex((n) => n.id === node.id);

            // Determine the range direction
            const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

            // Get nodes within the range
            const rangeNodes = flatTree.slice(start, end + 1);

            // Add range nodes and remove any descendant nodes if their parent is included
            const updatedSelected = [...selectedNodes, ...rangeNodes].filter(
                (node, index, self) =>
                    self.findIndex((n) => n.id === node.id) === index // Remove duplicates
            );

            // Remove descendant nodes if their parent is selected
            const descendantIds = updatedSelected.flatMap((n) => getAllDescendantIds(n));
            const result: TNode<CustomData>[] = updatedSelected.filter((n) => !descendantIds.includes(n.id));

            setSelectedNodeIds(result.map((item) => item.id));
            setSelectedNodes(result);

            return;
        }

        setSelectedNodeIds([node.id]);
        setSelectedNodes([node]);

        setLastSelectedNode(node);
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
