import { Avatar } from '../../api/generated/model/avatar';

export interface IUser {
  playerId?: string;
  nickname?: string;
  language?: string;
  mail?: string;
  avatar?: any;
  territoryId?: string;
}
export class User implements IUser {
  constructor(
    public playerId?: string,
    public nickname?: string,
    public language?: string,
    public mail?: string,
    public avatar?: any,
    public territoryId?: string
  ) { }
}
