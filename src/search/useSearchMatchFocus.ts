import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useLinearItems } from "../controlledEnvironment/useLinearItems";
import { useTree } from "../tree/Tree";
import { useCallSoon } from "../useCallSoon";
import { useSideEffect } from "../useSideEffect";
import { defaultMatcher } from "./defaultMatcher";

export const useSearchMatchFocus = () => {
    const { doesSearchMatchItem, items, getItemTitle, onFocusItem } = useTreeEnvironment();
    const { search, treeId } = useTree();
    const linearItems = useLinearItems(treeId);
    const callSoon = useCallSoon();

    useSideEffect(
        () => {
            if (search && search.length > 0) {
                callSoon(() => {
                    const focusItem = linearItems.find(({ item }) =>
                        (doesSearchMatchItem ?? defaultMatcher)(search, items[item], getItemTitle(items[item]))
                    );

                    if (focusItem) {
                        onFocusItem?.(items[focusItem.item], treeId);
                    }
                });
            }
        },
        [doesSearchMatchItem, getItemTitle, linearItems, items, onFocusItem, search, treeId, callSoon],
        [search]
    );
};
