import { EventEmitter } from "../EventManager/EventEmitter";
import { DataSource, Disposable, TreeDataProvider, TreeItem, TreeItemIndex } from "../types";

export class DataProvider implements TreeDataProvider {
    private data: DataSource;

    private componentDidUpdateEmitter = new EventEmitter<TreeItemIndex[]>();

    private setItemName?: (item: TreeItem, newName: string) => TreeItem;

    constructor(items: Record<TreeItemIndex, TreeItem>, setItemName?: (item: TreeItem, newName: string) => TreeItem) {
        this.data = { items };
        this.setItemName = setItemName;
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

    public async onRenameItem(item: TreeItem, name: string): Promise<void> {
        console.log(this.setItemName, this.setItemName?.(item, name), item, name);
        if (this.setItemName) {
            this.data.items[item.index] = this.setItemName(item, name);
            // this.onDidChangeTreeDataEmitter.emit(item.index);
        }
    }
}
