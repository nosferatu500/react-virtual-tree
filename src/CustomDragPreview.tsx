import React from "react";
import { TNode } from "./TreeNode";
import styles from './CustomDragPreview.module.css';

interface CustomDragProps {
    node: TNode;
    count: number;
}

const CustomDragPreview: React.FC<CustomDragProps> = ({ node, count }: CustomDragProps) => {
    return (
        <div className={styles.previewBox}>
            {node.type === "folder" ? "📁" : "📄"} {node.name}
            {count > 1 && <div className={styles.countBadge}>{count}</div>}
        </div>
    );
};

export default CustomDragPreview;
