import * as React from "react";
import { useContext } from "react";
import { ControlledTreeEnvironmentProps, TreeEnvironmentContextProps } from "../types";
import { DragAndDropProvider } from "./DragAndDropProvider";
import { InteractionManagerProvider } from "./InteractionManagerProvider";
import { useControlledTreeEnvironmentProps } from "./useControlledTreeEnvironmentProps";

const TreeEnvironmentContext = React.createContext<TreeEnvironmentContextProps>(null as any);
export const useTreeEnvironment = () => useContext(TreeEnvironmentContext);

export const ControlledTreeEnvironment = (props: ControlledTreeEnvironmentProps) => {
    const environmentContextProps = useControlledTreeEnvironmentProps(props);

    const { viewState } = props;

    // Make sure that every tree view state has a focused item
    for (const treeId of Object.keys(environmentContextProps.trees)) {
        // TODO if the focus item is dragged out of the tree and is not within the expanded items
        // TODO of that tree, the tree does not show any focus item anymore.
        // Fix: use linear items to see if focus item is visible, and reset if not. Only refresh that
        // information when the viewstate changes
        if (!viewState[treeId]?.focusedItem && environmentContextProps.trees[treeId]) {
            viewState[treeId] = {
                ...viewState[treeId],
                focusedItem: props.items[environmentContextProps.trees[treeId].rootItem]?.children?.[0],
            };
        }
    }

    return (
        <TreeEnvironmentContext.Provider value={environmentContextProps}>
            {/* @ts-ignore */}
            <InteractionManagerProvider>
                {/* @ts-ignore */}
                <DragAndDropProvider>{props.children}</DragAndDropProvider>
            </InteractionManagerProvider>
        </TreeEnvironmentContext.Provider>
    );
};
