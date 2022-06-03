import React from "react";
import { TreeRenderProps } from "../types";
import { classnames } from "../utils";
import "./style.css";

export const createDefaultRenderer = (renderer: TreeRenderProps): TreeRenderProps => {
    return {
        renderDepthOffset: 4,
        renderItemTitle: ({ title, item, context, treeMeta }) => {
            if (!treeMeta.isSearching || !context.isSearchMatching) {
                return <>{title}</>;
            }
            const startIndex = title.toLowerCase().indexOf(treeMeta.search!.toLowerCase());
            return (
                <>
                    {startIndex > 0 && <span>{title.slice(0, startIndex)}</span>}
                    <span className="rvt-tree-item-search-highlight">
                        {title.slice(startIndex, startIndex + treeMeta.search!.length)}
                    </span>
                    {startIndex + treeMeta.search!.length < title.length && (
                        <span>{title.slice(startIndex + treeMeta.search!.length, title.length)}</span>
                    )}
                </>
            );
        },
        renderItem: ({ ref, item, style, depth, children, title, context, treeMeta }) => {
            const InnerComponent = context.isRenaming ? "div" : "button";
            return (
                <li
                    {...(context.itemContainerWithChildrenProps as any)}
                    role="none"
                    className={classnames(
                        "rvt-tree-item-li",
                        item.isFolder && "rvt-tree-item-li-folder",
                        context.isSelected && "rvt-tree-item-li-selected",
                        context.isExpanded && "rvt-tree-item-li-expanded",
                        context.isFocused && "rvt-tree-item-li-focused",
                        context.isDraggingOver && "rvt-tree-item-li-dragging-over",
                        context.isSearchMatching && "rvt-tree-item-li-search-match"
                    )}
                >
                    <InnerComponent
                        ref={ref}
                        {...(context.itemContainerWithoutChildrenProps as any)}
                        {...(context.elementProps as any)}
                        style={{ paddingLeft: `${(depth + 1) * (renderer.renderDepthOffset ?? 10)}px`, ...style }}
                        className={classnames(
                            "rvt-tree-item-button",
                            item.isFolder && "rvt-tree-item-button-folder",
                            context.isSelected && "rvt-tree-item-button-selected",
                            context.isExpanded && "rvt-tree-item-button-expanded",
                            context.isFocused && "rvt-tree-item-button-focused",
                            context.isDraggingOver && "rvt-tree-item-button-dragging-over",
                            context.isSearchMatching && "rvt-tree-item-button-search-match"
                        )}
                    >
                        {title}
                    </InnerComponent>
                    {children}
                </li>
            );
        },
        renderRenameInput: ({ item, inputProps, inputRef, submitButtonProps, formProps }) => {
            return (
                <form {...formProps} className="rvt-tree-item-renaming-form">
                    <input {...inputProps} ref={inputRef} className="rvt-tree-item-renaming-input" />
                    <input
                        {...submitButtonProps}
                        type="submit"
                        className="rvt-tree-item-renaming-submit-button"
                        value="🗸"
                    />
                </form>
            );
        },
        renderDraggingItem: (items) => {
            return <div />;
        },
        renderDraggingItemTitle: (items) => {
            return <div />;
        },
        renderTreeContainer: ({ ref, treeId, children, treeMeta }) => {
            return (
                <div
                    ref={ref}
                    className={classnames(
                        "rvt-tree-root",
                        treeMeta.isFocused && "rvt-tree-root-focus",
                        treeMeta.isRenaming && "rvt-tree-root-renaming",
                        treeMeta.areItemsSelected && "rvt-tree-root-itemsselected"
                    )}
                >
                    <div
                        {...({
                            role: "tree",
                            "data-rvt-tree": treeId,
                        } as any)}
                        style={{ position: "relative" }}
                    >
                        {children}
                    </div>
                </div>
            );
        },
        renderItemsContainer: ({ children, containerProps, treeMeta }) => {
            return (
                <ul {...containerProps} className="rvt-tree-items-container">
                    {children}
                </ul>
            );
        },
        renderDragBetweenLine: ({ draggingPosition, lineProps }) => {
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
        renderSearchInput: (inputProps) => {
            return (
                <div className={classnames("rvt-tree-search-input-container")}>
                    <input {...inputProps} className={classnames("rvt-tree-search-input")} />
                </div>
            );
        },
    };
};
