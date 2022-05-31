import React from 'react';
import { TreeRenderProps } from '../types';
import { classnames } from '../utils';
import "./style.css";

export const createDefaultRenderer = (renderer: TreeRenderProps): TreeRenderProps => {
    return {
        renderItemTitle: renderer.renderItemTitle,
        renderItem: (item, depth, children, context) => {
            return (
                <li
                    role="none"
                    className={classnames(
                        'rvt-tree-item-li',
                        item.isFolder && 'rvt-tree-item-li-folder',
                        context.isSelected && 'rvt-tree-item-li-selected',
                        context.isExpanded && 'rvt-tree-item-li-expanded',
                        context.isDraggingOver && 'rvt-tree-item-li-dragging-over',
                    )}
                >
                    <button
                        {...context.itemContainerProps as any}
                        {...context.elementProps as any}
                        role="treeitem"
                        tabIndex={-1}
                        style={{ paddingLeft: `${(depth + 1) * (renderer.renderDepthOffset ?? 10)}px` }}
                        className={classnames(
                            'rvt-tree-item-button',
                            item.isFolder && 'rvt-tree-item-button-folder',
                            context.isSelected && 'rvt-tree-item-button-selected',
                            context.isExpanded && 'rvt-tree-item-button-expanded',
                            context.isDraggingOver && 'rvt-tree-item-button-dragging-over',
                        )}
                    >
                        {renderer.renderItemTitle(item, context)}
                    </button>
                    {children}
                </li>
            )
        },
        renderRenameInput: (item, inputProps, submitButtonProps) => {
            return <div />;
        },
        renderDraggingItem: items => {
            return <div />;
        },
        renderDraggingItemTitle: items => {
            return <div />;
        },
        renderTreeContainer: (children, containerProps, meta) => {
            return (
                <div
                    {...containerProps}
                    className={classnames(
                        'rvt-tree-root',
                        meta.isFocused && 'rvt-tree-root-focus',
                        meta.isRenaming && 'rvt-tree-root-renaming',
                        meta.areItemsSelected && 'rvt-tree-root-itemsselected',
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
                        'rvt-tree-drag-between-line',
                        draggingPosition.targetType === 'between-items' && draggingPosition.linePosition === 'top' && 'rvt-tree-drag-between-line-top',
                        draggingPosition.targetType === 'between-items' && draggingPosition.linePosition === 'bottom' && 'rvt-tree-drag-between-line-bottom',
                    )}
                />
            );
        },
        renderDepthOffset: 4,
    }
}