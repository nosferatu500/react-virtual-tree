import { CSSProperties } from "react";
import { TNode } from "./TreeNode";

interface CustomDragProps {
    node: TNode;
    count: number;
}

const CustomDragPreview = ({ node, count }: CustomDragProps) => {
    const previewStyle: CSSProperties = {
        padding: "8px 16px",
        borderRadius: "4px",
        backgroundColor: "rgba(0, 123, 255, 0.8)",
        color: "white",
        pointerEvents: "none", // Prevents interfering with drop targets
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        position: "relative", // For positioning the count badge
    };

    const countBadgeStyle: CSSProperties = {
        position: "absolute",
        top: "-10px",
        right: "-10px",
        backgroundColor: "red",
        color: "white",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
    };

    return (
        <div style={previewStyle}>
            {node.type === "folder" ? "📁" : "📄"} {node.name}
            {count > 1 && <div style={countBadgeStyle}>{count}</div>}
        </div>
    );
};

export default CustomDragPreview;
