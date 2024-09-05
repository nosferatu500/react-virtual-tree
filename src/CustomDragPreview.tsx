import React from "react";
import { TNode } from "./TreeNode";
import './CustomDragPreview.css';

interface CustomDragProps {
    node: TNode;
    count: number;
}

const CustomDragPreview: React.FC<CustomDragProps> = ({ node, count }: CustomDragProps) => {
    return (
        <div className="previewBox">
            {node.type === "folder" ? "📁" : "📄"} {node.name}
            {count > 1 && <div className="countBadge">{count}</div>}
        </div>
    );
};

export default CustomDragPreview;
