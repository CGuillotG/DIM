import { tl } from 'app/i18next-t';
import { DimItem } from 'app/inventory/item-types';
import { FilterDefinition } from 'app/search/filter-types';
import { InventoryWishListRoll } from 'app/wishlists/wishlists';
import { checkIfIsDupe, computeDupes, makeDupeID } from './dupes';

const checkIfIsWishlist = (
  item: DimItem,
  wishListFunction: (item: DimItem) => InventoryWishListRoll | undefined,
) => {
  const roll = wishListFunction(item);
  return roll && !roll.isUndesirable;
};

const wishlistFilters: FilterDefinition[] = [
  {
    keywords: 'wishlist',
    description: tl('Filter.Wishlist'),
    destinyVersion: 2,
    filter:
      ({ wishListFunction }) =>
      (item) =>
        checkIfIsWishlist(item, wishListFunction),
  },
  {
    keywords: 'wishlistdupe',
    description: tl('Filter.WishlistDupe'),
    destinyVersion: 2,
    filter: ({ wishListFunction, allItems }) => {
      const duplicates = computeDupes(allItems);
      return (item) => {
        const dupeId = makeDupeID(item);
        if (!checkIfIsDupe(duplicates, dupeId, item)) {
          return false;
        }
        const itemDupes = duplicates?.[dupeId];
        return itemDupes?.some((d) => checkIfIsWishlist(d, wishListFunction));
      };
    },
  },
  {
    keywords: 'wishlistnotes',
    description: tl('Filter.WishlistNotes'),
    format: 'freeform',
    destinyVersion: 2,
    filter:
      ({ wishListFunction, filterValue }) =>
      (item) =>
        wishListFunction(item)?.notes?.toLocaleLowerCase().includes(filterValue),
  },
  {
    keywords: 'trashlist',
    description: tl('Filter.Trashlist'),
    destinyVersion: 2,
    filter:
      ({ wishListFunction }) =>
      (item) =>
        wishListFunction(item)?.isUndesirable,
  },
  {
    keywords: 'wishlistunknown',
    destinyVersion: 2,
    description: tl('Filter.WishlistUnknown'),
    filter:
      ({ wishListsByHash }) =>
      (item) =>
        !wishListsByHash.has(item.hash),
  },
];

export default wishlistFilters;
