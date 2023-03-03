import { create } from 'zustand';
import { AssetItem } from '@models/index';

interface ActivityItemsBlindStore {
  assetItems: AssetItem[];
  addItem: (item: AssetItem) => void;
  editItem: (item: AssetItem, id: string) => void;
  deleteItem: (id: string) => void;
  resetItems: () => void;
}
const activityItemsBlindStore = create<ActivityItemsBlindStore>((set, get) => ({
  assetItems: [],
  addItem: (item: AssetItem) => {
    let pre = get().assetItems;
    set({ assetItems: [...pre, item] });
  },
  editItem: (item: AssetItem, id: string) => {
    let tempAssets = get().assetItems;
    const index = tempAssets.findIndex((e: AssetItem) => e.key === id);
    tempAssets.splice(index, 1);
    set({ assetItems: [...tempAssets, item] });
  },
  deleteItem: (id: string) => {
    let temAssets = get().assetItems;
    const index = temAssets.findIndex((e: AssetItem) => e.key === id);
    temAssets.splice(index, 1);
    set({ assetItems: [...temAssets] });
  },
  resetItems: () => {
    set({ assetItems: [] });
  },
}));

export const useAssetItemsBlind = () => activityItemsBlindStore((state) => state.assetItems);
export const useAddItem = () => activityItemsBlindStore((state) => state.addItem);
export const useEditItem = () => activityItemsBlindStore((state) => state.editItem);
export const useDeleteItem = () => activityItemsBlindStore((state) => state.deleteItem);
export const useResetItems = () => activityItemsBlindStore((state) => state.resetItems);
