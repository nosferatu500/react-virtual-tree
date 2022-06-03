import { TreeItem } from "../types";

export const defaultMatcher: <T = any>(search: string, item: TreeItem, itemTitle: string) => boolean = (
    search,
    item,
    itemTitle
) => {
    return itemTitle.toLowerCase().includes(search.toLowerCase());
};
