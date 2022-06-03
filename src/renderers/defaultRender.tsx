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
        renderItemArrow: ({ item, context }) => {
            // Icons from https://blueprintjs.com/docs/#icons
            return (
                <div
                    className={classnames(item.isFolder && "rvt-tree-item-arrow-isFolder", "rvt-tree-item-arrow")}
                    {...context.arrowProps}
                >
                    {item.isFolder &&
                        (context.isExpanded ? (
                            <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 16 16"
                                enableBackground="new 0 0 16 16"
                                xmlSpace="preserve"
                            >
                                <g id="chevron_down">
                                    <g>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M12,5c-0.28,0-0.53,0.11-0.71,0.29L8,8.59L4.71,5.29C4.53,5.11,4.28,5,4,5
                            C3.45,5,3,5.45,3,6c0,0.28,0.11,0.53,0.29,0.71l4,4C7.47,10.89,7.72,11,8,11s0.53-0.11,0.71-0.29l4-4C12.89,6.53,13,6.28,13,6
                            C13,5.45,12.55,5,12,5z"
                                            className="rvt-tree-item-arrow-path"
                                        />
                                    </g>
                                </g>
                            </svg>
                        ) : (
                            <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 16 16"
                                enableBackground="new 0 0 16 16"
                                xmlSpace="preserve"
                            >
                                <g id="chevron_right">
                                    <g>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M10.71,7.29l-4-4C6.53,3.11,6.28,3,6,3C5.45,3,5,3.45,5,4
                            c0,0.28,0.11,0.53,0.29,0.71L8.59,8l-3.29,3.29C5.11,11.47,5,11.72,5,12c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29l4-4
                            C10.89,8.53,11,8.28,11,8C11,7.72,10.89,7.47,10.71,7.29z"
                                            className="rvt-tree-item-arrow-path"
                                        />
                                    </g>
                                </g>
                            </svg>
                        ))}
                </div>
            );
        },
        renderItem: ({ ref, item, style, depth, children, title, context, arrow }) => {
            const InteractiveComponent = context.isRenaming ? "div" : "button";
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
                    <div
                        ref={ref}
                        {...(context.itemContainerWithoutChildrenProps as any)}
                        style={{ paddingLeft: `${(depth + 1) * (renderer.renderDepthOffset ?? 10)}px`, ...style }}
                        className={classnames(
                            "rvt-tree-item-title-container",
                            item.isFolder && "rvt-tree-item-title-container-isFolder",
                            context.isSelected && "rvt-tree-item-title-container-selected",
                            context.isExpanded && "rvt-tree-item-title-container-expanded",
                            context.isFocused && "rvt-tree-item-title-container-focused",
                            context.isDraggingOver && "rvt-tree-item-title-container-dragging-over",
                            context.isSearchMatching && "rvt-tree-item-title-container-search-match"
                        )}
                    >
                        {arrow}
                        <InteractiveComponent
                            {...(context.elementProps as any)}
                            className={classnames(
                                "rvt-tree-item-button",
                                item.isFolder && "rvt-tree-item-button-isFolder",
                                context.isSelected && "rvt-tree-item-button-selected",
                                context.isExpanded && "rvt-tree-item-button-expanded",
                                context.isFocused && "rvt-tree-item-button-focused",
                                context.isDraggingOver && "rvt-tree-item-button-dragging-over",
                                context.isSearchMatching && "rvt-tree-item-button-search-match"
                            )}
                        >
                            {title}
                        </InteractiveComponent>
                    </div>
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
