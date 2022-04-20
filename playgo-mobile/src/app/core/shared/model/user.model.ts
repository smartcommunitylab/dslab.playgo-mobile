import { IAvatar } from './avatar.model';

export interface IUser {
  playerId?: string;
  nickname?: string;
  language?: string;
  mail?: string;
  avatar?: IAvatar;
  territoryId?: string;
}
export class User implements IUser {
  constructor(
    public playerId?: string,
    public nickname?: string,
    public language?: string,
    public mail?: string,
    public avatar?: IAvatar,
    public territoryId?: string
  ) {}
}
