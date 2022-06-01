import { EventEmitter } from "../EventManager/EventEmitter";
import { DataSource, Disposable, TreeDataProvider, TreeItem, TreeItemIndex } from "../types";

export class DataProvider implements TreeDataProvider {
    private data: DataSource;
    private componentDidUpdateEmitter = new EventEmitter<TreeItemIndex[]>();

    constructor(items: Record<TreeItemIndex, TreeItem>) {
        this.data = { items };
    }

    public componentDidUpdate(listener: (changedItemIds: TreeItemIndex[]) => void): Disposable {
        const handlerId = this.componentDidUpdateEmitter.on((payload) => listener(payload));
        return { dispose: () => this.componentDidUpdateEmitter.off(handlerId) };
    }

    public async getItem(itemId: TreeItemIndex): Promise<TreeItem> {
        return this.data.items[itemId];
    }

    public getData() {
        return this.data.items;
    }

    public async onChangeItemChildren(itemId: TreeItemIndex, newChildren: TreeItemIndex[]): Promise<void> {
        this.data.items[itemId].children = newChildren;
        this.componentDidUpdateEmitter.emit([itemId]);
    }
}
