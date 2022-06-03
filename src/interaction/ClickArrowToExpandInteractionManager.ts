import { HTMLProps } from "react";
import {
    InteractionManager,
    InteractionMode,
    TreeItem,
    TreeItemActions,
    TreeItemRenderFlags,
    VirtualTreeContextProps,
} from "../types";

export class ClickArrowToExpandInteractionManager implements InteractionManager {
    public readonly mode = InteractionMode.ClickItemToExpand;

    private context: VirtualTreeContextProps;

    constructor(context: VirtualTreeContextProps) {
        this.context = context;
    }

    createInteractiveElementProps(
        item: TreeItem,
        treeId: string,
        actions: TreeItemActions,
        renderFlags: TreeItemRenderFlags
    ): HTMLProps<HTMLElement> {
        return {
            onClick: (e) => {
                actions.focusItem();
                if (e.shiftKey) {
                    actions.selectUpTo();
                    // TODO: isWindows
                } else if (e.ctrlKey || e.metaKey) {
                    if (renderFlags.isSelected) {
                        actions.unselectItem();
                    } else {
                        actions.addToSelectedItems();
                    }
                } else if (!item.isFolder || this.context.canInvokePrimaryActionOnItemContainer) {
                    actions.primaryAction();
                }

                if (this.context.onClick) {
                    this.context.onClick(item);
                }
            },
            onFocus: () => {
                actions.focusItem();
            },
            tabIndex: !renderFlags.isRenaming ? (renderFlags.isFocused ? 0 : -1) : undefined,
        };
    }
}
