interface AvatarUrl {
  avatarSmallUrl: string;
  avatarUrl: string;
}

export interface IUser {
  playerId?: string;
  nickname?: string;
  language?: string;
  mail?: string;
  avatar?: AvatarUrl;
  territoryId?: string;
}
export class User implements IUser {
  constructor(
    public playerId?: string,
    public nickname?: string,
    public language?: string,
    public mail?: string,
    public avatar?: AvatarUrl,
    public territoryId?: string
  ) {}
}
