import React, { CSSProperties, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export interface TNode {
    id: React.Key
    name: string
    type: "folder" | "file"
    children: TNode[]
}

const ItemTypes = {
    FILE: 'file',
    FOLDER: 'folder',
}

type Props = {
    node: TNode
    onMove: (draggedNode: TNode, targetNode: TNode) => void
}

export const TreeNode: React.FC<Props> = ({ node, onMove }) => {
    const [expanded, setExpanded] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.FILE,
        item: { node },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver, handlerId }, drop] = useDrop({
        accept: ItemTypes.FILE,
        drop: (draggedItem: { node: TNode }, monitor) => {
            if (monitor.didDrop()) return;
            
            onMove(draggedItem.node, node)
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            handlerId: monitor.getHandlerId()
        }),
    });

    drag(drop(ref))

    const style: CSSProperties = {
        marginLeft: 20,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#e0e0e0' : 'transparent',
        cursor: 'pointer',
    }

    return (
        <div key={node.id} ref={ref} style={style} data-handler-id={handlerId}>
            {node.type === 'folder' ? (
                <>
                    <span onClick={toggleExpand}>
                        {expanded ? '📂' : '📁'} {node.name}
                    </span>
                    {expanded &&
                        node.children.map((childNode) => (
                            <TreeNode key={childNode.id} node={childNode} onMove={onMove}/>
                        ))}
                </>
            ) : (
                <span>📄 {node.name}</span>
            )}
        </div>
    );
};
