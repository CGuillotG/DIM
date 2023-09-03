import { ExpandableTextBlock } from 'app/dim-ui/ExpandableTextBlock';
import ExternalLink from 'app/dim-ui/ExternalLink';
import RichDestinyText from 'app/dim-ui/destiny-symbols/RichDestinyText';
import { t } from 'app/i18next-t';
import { DimItem } from 'app/inventory/item-types';
import { wishListSelector } from 'app/wishlists/selectors';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import ishtarLogo from '../../images/ishtar-collective.svg';
import styles from './ItemDescription.m.scss';
import NotesArea from './NotesArea';

export default function ItemDescription({ item }: { item: DimItem }) {
  const wishlistItem = useSelector(wishListSelector(item));

  // suppressing some unnecessary information for weapons and armor,
  // to make room for all that other delicious info
  const showFlavor = !item.bucket.inWeapons && !item.bucket.inArmor;

  return (
    <>
      {showFlavor && (
        <>
          {Boolean(item.description?.length) && (
            <div className={styles.description}>
              <RichDestinyText text={item.description} ownerId={item.owner} />
            </div>
          )}
          {Boolean(item.displaySource?.length) && (
            <div className={clsx(styles.description, styles.secondaryText)}>
              <RichDestinyText text={item.displaySource} ownerId={item.owner} />
            </div>
          )}
        </>
      )}
      {!$featureFlags.triage && wishlistItem && Boolean(wishlistItem?.notes?.length) && (
        <ExpandableTextBlock linesWhenClosed={3} className={styles.description}>
          <span className={styles.label}>{t('WishListRoll.WishListNotes')}</span>
          <span className={styles.secondaryText}>{wishlistItem.notes}</span>
        </ExpandableTextBlock>
      )}
      <NotesArea item={item} className={styles.description} />
    </>
  );
}

export function LoreLink({ loreHash }: { loreHash: number }) {
  if (!loreHash) {
    return null;
  }

  const loreLink = `http://www.ishtar-collective.net/entries/${loreHash}`;

  return (
    <ExternalLink className={styles.loreLink} href={loreLink} title={t('MovePopup.ReadLore')}>
      <img src={ishtarLogo} height="16" width="16" />
      {t('MovePopup.ReadLoreLink')}
    </ExternalLink>
  );
}
