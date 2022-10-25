import { PlayerCampaign } from '../../api/generated/model/playerCampaign';

export function getCampaignImage(campaignContainer: PlayerCampaign): string {
  const logo = campaignContainer?.campaign?.logo;
  const base64Image = logo?.image
    ? 'data:image/jpg;base64,' + logo.image
    : null;
  return logo?.url ?? base64Image ?? transparentPixel;
}

const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
