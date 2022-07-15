import ClarityDescriptions from 'app/clarity/descriptions/ClarityDescriptions';
import BungieImage from 'app/dim-ui/BungieImage';
import {
  TooltipContext,
  TooltipCustomize,
  TooltipHeader,
  TooltipSection,
  TooltipSubheader,
} from 'app/dim-ui/PressTip';
import RichDestinyText from 'app/dim-ui/RichDestinyText';
import { t } from 'app/i18next-t';
import { resonantElementObjectiveHashes } from 'app/inventory/store/deepsight';
import { isPluggableItem } from 'app/inventory/store/sockets';
import { statAllowList } from 'app/inventory/store/stats';
import { useD2Definitions } from 'app/manifest/selectors';
import { EXOTIC_CATALYST_TRAIT } from 'app/search/d2-known-values';
import { thumbsUpIcon } from 'app/shell/icons';
import AppIcon from 'app/shell/icons/AppIcon';
import { isPlugStatActive } from 'app/utils/item-utils';
import { usePlugDescriptions } from 'app/utils/plug-descriptions';
import { isEnhancedPerk } from 'app/utils/socket-utils';
import { InventoryWishListRoll } from 'app/wishlists/wishlists';
import {
  DestinyInventoryItemDefinition,
  DestinyObjectiveProgress,
  DestinyPlugItemCraftingRequirements,
  TierType,
} from 'bungie-api-ts/destiny2';
import clsx from 'clsx';
import enhancedIntrinsics from 'data/d2/crafting-enhanced-intrinsics';
import _ from 'lodash';
import { useContext } from 'react';
import { DimItem, DimPlug } from '../inventory/item-types';
import Objective from '../progress/Objective';
import './ItemSockets.scss';
import styles from './PlugTooltip.m.scss';

// TODO: Connect this to redux
export function DimPlugTooltip({
  item,
  plug,
  wishlistRoll,
  craftingData,
}: {
  item: DimItem;
  plug: DimPlug;
  wishlistRoll?: InventoryWishListRoll;
  craftingData?: DestinyPlugItemCraftingRequirements;
}) {
  // TODO: show insertion costs

  const wishListTip = wishlistRoll?.wishListPerks.has(plug.plugDef.hash)
    ? t('WishListRoll.BestRatedTip', { count: wishlistRoll.wishListPerks.size })
    : undefined;

  const visibleStats = plug.stats
    ? _.sortBy(
        Object.keys(plug.stats)
          .map((statHashStr) => parseInt(statHashStr, 10))
          .filter(
            (statHash) =>
              statAllowList.includes(statHash) &&
              isPlugStatActive(
                item,
                plug.plugDef,
                statHash,
                Boolean(
                  plug.plugDef.investmentStats.find((s) => s.statTypeHash === Number(statHash))
                    ?.isConditionallyActive
                )
              )
          ),
        (h) => statAllowList.indexOf(h)
      )
    : [];

  const stats: { [statHash: string]: number } = {};

  for (const statHash of visibleStats) {
    const value = plug.stats?.[statHash];
    if (value) {
      stats[statHash] = value;
    }
  }

  // Only show Exotic catalyst requirements if the catalyst is incomplete. We assume
  // that an Exotic weapon can only be masterworked if its catalyst is complete.
  const hideRequirements =
    plug.plugDef.traitHashes?.includes(EXOTIC_CATALYST_TRAIT) && item.masterwork;

  // The PlugTooltip does all the rendering and layout, we just process information here.
  return (
    <PlugTooltip
      def={plug.plugDef}
      stats={stats}
      plugObjectives={plug.plugObjectives}
      enableFailReasons={plug.enableFailReasons}
      cannotCurrentlyRoll={plug.cannotCurrentlyRoll}
      wishListTip={wishListTip}
      hideRequirements={hideRequirements}
      craftingData={craftingData}
    />
  );
}

/**
 * This creates a tooltip for a plug with various levels of content.
 *
 * It only relies on Bungie API entities, objects or primitives. This is so we can use it to render a
 * tooltip from either a DimPlug or a DestinyInventoryItemDefinition.
 *
 * Use this directly if you want to render a tooltip for a DestinyInventoryItemDefinition, only the def
 * prop is required.
 */
export function PlugTooltip({
  def,
  stats,
  plugObjectives,
  enableFailReasons,
  cannotCurrentlyRoll,
  wishListTip,
  hideRequirements,
  craftingData,
}: {
  def: DestinyInventoryItemDefinition;
  stats?: { [statHash: string]: number };
  plugObjectives?: DestinyObjectiveProgress[];
  enableFailReasons?: string;
  cannotCurrentlyRoll?: boolean;
  wishListTip?: string;
  hideRequirements?: boolean;
  craftingData?: DestinyPlugItemCraftingRequirements;
}) {
  const defs = useD2Definitions();
  const statsArray =
    (stats &&
      Object.entries(stats).map(([statHash, value]) => ({
        value,
        statHash: parseInt(statHash, 10),
      }))) ||
    [];
  const plugDescriptions = usePlugDescriptions(def, statsArray);
  const sourceString =
    defs && def.collectibleHash && defs.Collectible.get(def.collectibleHash).sourceString;

  // filter out plug objectives related to Resonant Elements
  const filteredPlugObjectives = plugObjectives?.filter(
    (o) => !resonantElementObjectiveHashes.includes(o.objectiveHash)
  );

  const bungieDescription =
    plugDescriptions.perks.length > 0 &&
    plugDescriptions.perks.map((perkDesc) => (
      <div key={perkDesc.perkHash}>
        {perkDesc.name && <div className={styles.perkName}>{perkDesc.name}</div>}
        {perkDesc.description && <RichDestinyText text={perkDesc.description} />}
        {!hideRequirements && perkDesc.requirement && (
          <RichDestinyText text={perkDesc.requirement} className={styles.requirement} />
        )}
      </div>
    ));
  const clarityDescriptionSection = plugDescriptions.communityInsight && (
    <TooltipSection className={styles.communityInsightSection}>
      <ClarityDescriptions
        perk={plugDescriptions.communityInsight}
        className={styles.clarityDescription}
      />
    </TooltipSection>
  );
  const renderedStats = statsArray.length > 0 && (
    <div className="plug-stats">
      {statsArray.map((stat) => (
        <StatValue key={stat.statHash} statHash={stat.statHash} value={stat.value} />
      ))}
    </div>
  );

  const tooltip = useContext(TooltipContext);
  const enhanced =
    enhancedIntrinsics.has(def.hash) || (isPluggableItem(def) && isEnhancedPerk(def));
  return (
    <>
      <TooltipHeader text={def.displayProperties.name} />
      <TooltipSubheader text={def.itemTypeDisplayName} />
      <TooltipCustomize
        className={clsx(styles.tooltip, {
          [styles.tooltipExotic]: def.inventory?.tierType === TierType.Exotic,
          [styles.tooltipEnhanced]: enhanced,
        })}
      />
      {!tooltip && <h2>{def.displayProperties.name}</h2>}

      {/*
        If we're displaying the Bungie description, display the stats in the same section as the Bungie
        description. If we're not displaying the Bungie description, display the stats in a separate section
        after the community description.
      */}
      {bungieDescription ? (
        <>
          <TooltipSection>
            {bungieDescription}
            {renderedStats}
          </TooltipSection>
          {clarityDescriptionSection}
        </>
      ) : (
        (clarityDescriptionSection || renderedStats) && (
          <>
            {clarityDescriptionSection}
            <TooltipSection>{renderedStats}</TooltipSection>
          </>
        )
      )}

      <TooltipSection>
        {sourceString && <div className={styles.source}>{sourceString}</div>}
        {!hideRequirements && defs && filteredPlugObjectives && filteredPlugObjectives.length > 0 && (
          <div className={styles.objectives}>
            {filteredPlugObjectives.map((objective) => (
              <Objective key={objective.objectiveHash} objective={objective} />
            ))}
          </div>
        )}
        {enableFailReasons && <p>{enableFailReasons}</p>}
      </TooltipSection>

      {craftingData && (
        <TooltipSection className={styles.craftingRequirementsSection}>
          {craftingData.unlockRequirements.map((r) => (
            <p key={r.failureDescription}>{r.failureDescription}</p>
          ))}
          {defs &&
            craftingData.materialRequirementHashes.length &&
            craftingData.materialRequirementHashes.flatMap((h) => {
              const materialRequirement = defs?.MaterialRequirementSet.get(h).materials;
              return materialRequirement.map((m) => {
                if (!m.countIsConstant || m.omitFromRequirements) {
                  return null;
                }
                const itemName = defs.InventoryItem.get(m.itemHash).displayProperties.name;
                return (
                  <div key={`${m.itemHash}-${m.count}`}>
                    <b>{m.count}</b> {itemName}
                  </div>
                );
              });
            })}
        </TooltipSection>
      )}
      {cannotCurrentlyRoll && (
        <TooltipSection className={styles.cannotRollSection}>
          <p>{t('MovePopup.CannotCurrentlyRoll')}</p>
        </TooltipSection>
      )}
      {wishListTip && (
        <TooltipSection>
          <p>
            <AppIcon className="thumbs-up" icon={thumbsUpIcon} /> = {wishListTip}
          </p>
        </TooltipSection>
      )}
    </>
  );
}

export function StatValue({ value, statHash }: { value: number; statHash: number }) {
  const defs = useD2Definitions()!;
  const statDef = defs.Stat.get(statHash);
  if (!statDef || !statDef.displayProperties.name) {
    return null;
  }
  return (
    <>
      <div>
        {value < 0 ? '' : '+'}
        {value}
      </div>
      <div>
        {statDef.displayProperties.hasIcon && (
          <BungieImage height={16} width={16} src={statDef.displayProperties.icon} />
        )}
        {statDef.displayProperties.name}
      </div>
    </>
  );
}
