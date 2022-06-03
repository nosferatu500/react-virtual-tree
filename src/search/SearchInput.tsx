import { useContext } from "react";
import { useHtmlElementEventListener } from "../hooks/useHtmlElementEventListener";
import { useHotkey } from "../hotkeys/useHotkey";
import { TreeContext, TreeRenderContext, TreeSearchContext } from "../VirtualTree";
import { VirtualTreeContext } from "../VirtualTreeContext";

export const SearchInput: React.FC<{
    containerRef?: HTMLElement | HTMLDivElement | null;
}> = (props) => {
    const context = useContext(VirtualTreeContext);
    const renderers = useContext(TreeRenderContext);
    const { treeId } = useContext(TreeContext);
    const { search, setSearch } = useContext(TreeSearchContext);

    const isActiveTree = context.activeTreeId === treeId;

    const clearSearch = () => {
        setSearch(null);

        const focusItem = document.querySelector(`[data-rvt-tree="${treeId}"] [data-rvt-item-focus="true"]`);
        (focusItem as HTMLElement)?.focus?.();
    };

    useHotkey(
        "abortSearch",
        (e) => {
            clearSearch();
        },
        isActiveTree && search !== null,
        [search, isActiveTree]
    );

    useHtmlElementEventListener(props.containerRef, "keydown", (e) => {
        const unicode = e.key.charCodeAt(0);
        if (
            isActiveTree &&
            search === null &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey &&
            ((unicode >= 48 && unicode <= 57) || // number
                // (unicode >= 65 && unicode <= 90) || // uppercase letter
                (unicode >= 97 && unicode <= 122)) // lowercase letter
        ) {
            setSearch("");
            (document.querySelector('[data-rvt-search-input="true"]') as any)?.focus?.();
        }
    });

    if (search === null) {
        return null;
    }

    return renderers.renderSearchInput({
        value: search,
        onChange: (e: any) => setSearch(e.target.value),
        onBlur: () => {
            clearSearch();
        },
        ...({
            ["data-rvt-search-input"]: "true",
        } as any),
    }) as any;
};
