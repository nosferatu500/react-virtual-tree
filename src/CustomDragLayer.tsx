import { CSSProperties } from "react";
import { DragLayerMonitor, useDragLayer } from "react-dnd";
import CustomDragPreview from "./CustomDragPreview";

const collect = (monitor: DragLayerMonitor) => {
    return {
        item: monitor.getItem(),
        clientOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
    };
};

const CustomDragLayer = () => {
    const { item, clientOffset, isDragging } = useDragLayer(collect);

    if (!isDragging || !item) {
        return null; // Do not render if not dragging
    }

    const layerStyle: CSSProperties = {
        position: "fixed",
        pointerEvents: "none",
        top: clientOffset?.y,
        left: clientOffset?.x,
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
    };

    return (
        <div style={layerStyle}>
            {/* @ts-expect-error Update types */}
            <CustomDragPreview node={item.node} count={item.count} />
        </div>
    );
};

export default CustomDragLayer;
