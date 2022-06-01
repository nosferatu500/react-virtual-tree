import { useContext } from "react";
import { TreeContext } from "../VirtualTree";
import { VirtualTreeContext } from "../VirtualTreeContext";

export const useViewState = () => {
    const { treeId } = useContext(TreeContext);
    const context = useContext(VirtualTreeContext);
    return context.viewState[treeId] ?? {};
};
