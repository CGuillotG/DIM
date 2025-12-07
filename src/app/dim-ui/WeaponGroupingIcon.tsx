import TagIcon from 'app/inventory/TagIcon';
import { AmmoIcon } from 'app/item-popup/AmmoIcon';
import { VaultGroupIcon } from 'app/shell/item-comparators';
import { DestinyAmmunitionType } from 'bungie-api-ts/destiny2';
import ElementIcon from './ElementIcon';
import { getWeaponTypeSvgIconFromCategoryHashes } from './svgs/itemCategory';
import * as styles from './WeaponGroupingIcon.m.scss';

export default function WeaponGroupingIcon({
  icon,
  className,
}: {
  icon: VaultGroupIcon;
  className?: string;
}) {
  switch (icon.type) {
    case 'typeName': {
      const typeIcon = getWeaponTypeSvgIconFromCategoryHashes(icon.itemCategoryHashes);
      return (
        typeIcon && (
          <div className={className}>
            <typeIcon.svg className={styles.weaponTypeIcon} />
          </div>
        )
      );
    }

    case 'weaponAmmoType': {
      const typeIcon = getWeaponTypeSvgIconFromCategoryHashes(icon.itemCategoryHashes);
      let weaponAmmoClassName = styles.weaponTypeIconPrimary;
      if (icon.ammoType === DestinyAmmunitionType.Heavy) {
        weaponAmmoClassName = styles.weaponTypeIconHeavy;
      } else if (icon.ammoType === DestinyAmmunitionType.Special) {
        weaponAmmoClassName = styles.weaponTypeIconSpecial;
      }
      return (
        typeIcon && (
          <div className={className}>
            <typeIcon.svg className={weaponAmmoClassName} />
          </div>
        )
      );
    }

    case 'ammoType': {
      return (
        <div className={className}>
          <AmmoIcon type={icon.ammoType} className={styles.ammoIcon} />
        </div>
      );
    }

    case 'tag': {
      return (
        icon.tag && (
          <div className={className}>
            <TagIcon tag={icon.tag} />
          </div>
        )
      );
    }

    case 'elementWeapon': {
      return (
        <div className={className}>
          <ElementIcon className={styles.elementIcon} element={icon.element} />
        </div>
      );
    }

    case 'none':
      return null;
  }
}
