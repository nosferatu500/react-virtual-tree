import React, { useContext, useMemo, useState } from 'react';
import { TreeItemChildren } from './TreeItemChildren';
import { TreeItemIndex } from './types';
import { useViewState } from './useViewState';
import { createTreeItemRenderContext, createTreeItemRenderContextDependencies } from './utils';
import { TreeIdContext } from './VirtualTree';
import { VirtualTreeContext } from './VirtualTreeContext';

export const TreeItem = <T extends any>(props: {
    itemIndex: TreeItemIndex;
    depth: number;
}) => {
    const [hasBeenRequested, setHasBeenRequested] = useState(false);
    const treeId = useContext(TreeIdContext);
    const virtualTreeContext = useContext(VirtualTreeContext);
    const viewState = useViewState();
    const item = virtualTreeContext.items[props.itemIndex];

    const isExpanded = useMemo(() => viewState.expandedItems?.includes(props.itemIndex), [props.itemIndex, viewState.expandedItems]);
    const renderContext = useMemo(
        () => item && createTreeItemRenderContext(item, virtualTreeContext, treeId),
        createTreeItemRenderContextDependencies(item, virtualTreeContext, treeId)
    );

    if (item === undefined) {
        if (!hasBeenRequested) {
            setHasBeenRequested(true);
            virtualTreeContext.onMissingItems?.([props.itemIndex]);
        }
        return null;
    }

    return (
        <>
            {virtualTreeContext.renderItem(virtualTreeContext.items[props.itemIndex], props.depth, renderContext)}
            {item.children?.length > 0 && isExpanded && item.children && (
                <TreeItemChildren depth={props.depth + 1} parentId={props.itemIndex} children={item.children} />
            )}
        </>
    )
} 
