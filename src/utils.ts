export const buildMapForTrees = <T extends any>(
    treeIds: string[],
    build: (treeId: string) => T
): { [treeId: string]: T } => {
    return Object.fromEntries(treeIds.map((id) => [id, build(id)] as const).map(([id, obj]) => [id, obj]));
};
