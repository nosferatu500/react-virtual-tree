import React from 'react';
import { TreeRenderProps } from '../types';
import { classnames } from '../utils';

export const createDefaultRenderer = (renderer: TreeRenderProps): TreeRenderProps => {
    return {
        renderItemTitle: renderer.renderItemTitle,
        renderItem: (item, depth, context) => {
            return (
                <li
                    {...context.containerProps as any}
                    role="none"
                    style={{ paddingLeft: `${depth * (renderer.renderDepthOffset ?? 10)}px` }}
                    className={classnames(
                        'rvt-tree-item-li',
                        item.children.length > 0 && 'rvt-tree-item-li-hasChildren',
                        context.isSelected && 'rvt-tree-item-li-selected',
                        context.isExpanded && 'rvt-tree-item-li-expanded',
                        context.isDraggingOver && 'rvt-tree-item-li-dragging-over',
                    )}
                >
                    <button
                        role="treeitem"
                        {...context.elementProps as any}
                        className={classnames(
                            'rvt-tree-item-button',
                            item.children.length > 0 && 'rvt-tree-item-button-hasChildren',
                            context.isSelected && 'rvt-tree-item-button-selected',
                            context.isExpanded && 'rvt-tree-item-button-expanded',
                            context.isDraggingOver && 'rvt-tree-item-button-dragging-over',
                        )}
                    >
                        {renderer.renderItemTitle(item, context)}
                    </button>
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
        renderTreeContainer: (children, containerProps) => {
            return <div {...containerProps}>{children}</div>
        },
        renderDragBetweenLine: (draggingPosition) => {
            return (
              <div
                style={{ left: `${draggingPosition.depth * (renderer.renderDepthOffset ?? 10)}px` }}
                className={classnames(
                  'rvt-tree-drag-between-line',
                  draggingPosition.linePosition === 'top' && 'rvt-tree-drag-between-line-top',
                  draggingPosition.linePosition === 'bottom' && 'rvt-tree-drag-between-line-bottom',
                )}
              />
            );
          },
        renderDepthOffset: 4,
    }
}