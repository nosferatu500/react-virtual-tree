import React, { useMemo, useState } from 'react';
import { IndividualTreeViewState, TreeDataProvider, TreeItem, TreeItemIndex, VirtualForestWrapperProps } from './types';
import { VirtualForest } from './VirtualTreeContext';

const createDataProvider = (provider: TreeDataProvider): Required<TreeDataProvider> => ({
    ...provider,
    componentDidUpdate: provider.componentDidUpdate ?? (() => { }),
    getItems: provider.getItems ?? (itemIds => Promise.all(itemIds.map(id => provider.getItem(id)))),
    onRenameItem: provider.onRenameItem ?? (() => { }),
});

export const VirtualForestWrapper = <T extends any>(props: VirtualForestWrapperProps<T>) => {
    const [currentItems, setCurrentItems] = useState<Record<TreeItemIndex, TreeItem<T>>>({});
    const [viewState, setViewState] = useState(props.viewState);
    const dataProvider = createDataProvider(props.dataProvider);

    const writeItems = useMemo(() => (newItems: Record<TreeItemIndex, TreeItem<T>>) => {
        setCurrentItems(oldItems => ({ ...oldItems, ...newItems }));
    }, []);

    const updateState = (treeId: string, constructNewState: (oldState: IndividualTreeViewState) => Partial<IndividualTreeViewState>) => {
        setViewState(oldState => ({
            ...oldState,
            [treeId]: {
                ...oldState[treeId],
                ...constructNewState(oldState[treeId]),
            }
        }));
    }

    return (
        <VirtualForest
            {...props}
            viewState={viewState}
            items={currentItems}
            onExpandItem={(item, treeId) => {
                updateState(treeId, old => ({ ...old, expandedItems: [...old.expandedItems ?? [], item.index] }));
            }}
            onCollapseItem={(item, treeId) => {
                updateState(treeId, old => ({ ...old, expandedItems: old.expandedItems?.filter(id => id !== item.index) }));
            }}
            onSelectItems={(items, treeId) => {
                updateState(treeId, old => ({ ...old, selectedItems: items }));
            }}
            onStartRenamingItem={(item, treeId) => {
                updateState(treeId, old => ({ ...old, renamingItem: item.index }));
            }}
            onRenameItem={(item, name, treeId) => {
                dataProvider.onRenameItem(item, name);
                updateState(treeId, old => ({ ...old, renamingItem: undefined }));
            }}
            onMissingItems={itemIds => {
                console.log(`Retrieving items ${itemIds.join(', ')}`)
                dataProvider.getItems(itemIds).then(items => {
                    console.log(`Retrieved ${items.map(i => i.index).join(', ')}`)
                    writeItems(items.map(item => ({ [item.index]: item })).reduce((a, b) => ({ ...a, ...b }), {}));
                });
            }}
        >
            {props.children}
        </VirtualForest>
    );
}
