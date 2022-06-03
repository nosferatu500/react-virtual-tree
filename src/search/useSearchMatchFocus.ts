import { useEffect } from "react";
import { useGetLinearItems } from "../hooks/useGetLinearItems";
import { useTreeContext } from "../VirtualTree";
import { useVirtualTreeContext } from "../VirtualTreeContext";
import { defaultMatcher } from "./defaultMatcher";

export const useSearchMatchFocus = () => {
    const { doesSearchMatchItem, items, getItemTitle, onFocusItem } = useVirtualTreeContext();
    const { search, treeId } = useTreeContext();
    const getLinearItems = useGetLinearItems();

    useEffect(() => {
        if (search && search.length > 0) {
            requestAnimationFrame(() => {
                const focusItem = getLinearItems().find(({ item }) =>
                    (doesSearchMatchItem ?? defaultMatcher)(search, items[item], getItemTitle(items[item])));

                if (focusItem) {
                    onFocusItem?.(items[focusItem.item], treeId);
                }
            });
        }
    }, [search])
}
