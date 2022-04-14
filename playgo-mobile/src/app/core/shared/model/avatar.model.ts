export interface IAvatar {
  avatarData?: AvatarData;
  avatarDataSmall?: AvatarData;
  contentType?: string;
  fileName?: string;
  id?: string;
  playerId?: string;
}
export interface IAvatarData {
  data?: string;
  type?: string;
}
export class AvatarData implements IAvatarData {
  constructor(
    public data?: string,
    public type?: string
  ) { }
}
export class Avatar implements IAvatar {
  constructor(
    public avatarData?: AvatarData,
    public avatarDataSmall?: AvatarData,
    public contentType?: string,
    public fileName?: string,
    public id?: string,
    public playerId?: string
  ) { }
}
