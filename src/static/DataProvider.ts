import { DataSource, TreeDataProvider, TreeItem, TreeItemIndex } from '../types';

export class DataProvider<T = any> implements TreeDataProvider {
    private data: DataSource;

    constructor(items: Record<TreeItemIndex, TreeItem<T>>) {
        this.data = { items };
    }

    public async getItem(itemId: TreeItemIndex): Promise<TreeItem> {
        return this.data.items[itemId];
    }

    public onRenameItem(item: TreeItem<any>, name: string): void {
    }
}
