import React from "react";
import { TreeRenderProps } from "../types";
import { classnames } from "../utils";
import "./style.css";

export const createDefaultRenderer = (renderer: TreeRenderProps): TreeRenderProps => {
    return {
        renderItemTitle: renderer.renderItemTitle,
        renderItem: (ref, item, style, depth, children, context, info) => {
            return (
                <li
                    role="none"
                    className={classnames(
                        "rvt-tree-item-li",
                        item.isFolder && "rvt-tree-item-li-folder",
                        context.isSelected && "rvt-tree-item-li-selected",
                        context.isExpanded && "rvt-tree-item-li-expanded",
                        context.isFocused && "rvt-tree-item-li-focused",
                        context.isDraggingOver && "rvt-tree-item-li-dragging-over"
                    )}
                >
                    <button
                        ref={ref}
                        {...(context.itemContainerProps as any)}
                        {...(context.elementProps as any)}
                        role="treeitem"
                        tabIndex={context.isFocused ? 0 : -1}
                        style={{ paddingLeft: `${(depth + 1) * (renderer.renderDepthOffset ?? 10)}px`, ...style }}
                        className={classnames(
                            "rvt-tree-item-button",
                            item.isFolder && "rvt-tree-item-button-folder",
                            context.isSelected && "rvt-tree-item-button-selected",
                            context.isExpanded && "rvt-tree-item-button-expanded",
                            context.isFocused && "rvt-tree-item-button-focused",
                            context.isDraggingOver && "rvt-tree-item-button-dragging-over"
                        )}
                    >
                        {renderer.renderItemTitle(item, context)}
                    </button>
                    {children}
                </li>
            );
        },
        renderRenameInput: (item, inputProps, submitButtonProps) => {
            return <div />;
        },
        renderDraggingItem: (items) => {
            return <div />;
        },
        renderDraggingItemTitle: (items) => {
            return <div />;
        },
        renderTreeContainer: (ref, treeId, children, meta) => {
            return (
                <div
                    ref={ref}
                    style={{ position: "relative" }}
                    {...({
                        ["data-rvt-tree"]: treeId,
                    } as any)}
                    className={classnames(
                        "rvt-tree-root",
                        meta.isFocused && "rvt-tree-root-focus",
                        meta.isRenaming && "rvt-tree-root-renaming",
                        meta.areItemsSelected && "rvt-tree-root-itemsselected"
                    )}
                >
                    {children}
                </div>
            );
        },
        renderDragBetweenLine: (draggingPosition, lineProps) => {
            return (
                <div
                    {...lineProps}
                    style={{ left: `${draggingPosition.depth * (renderer.renderDepthOffset ?? 10)}px` }}
                    className={classnames(
                        "rvt-tree-drag-between-line",
                        draggingPosition.targetType === "between-items" &&
                            draggingPosition.linePosition === "top" &&
                            "rvt-tree-drag-between-line-top",
                        draggingPosition.targetType === "between-items" &&
                            draggingPosition.linePosition === "bottom" &&
                            "rvt-tree-drag-between-line-bottom"
                    )}
                />
            );
        },
        renderDepthOffset: 4,
    };
};
