export interface IAvatar {
  avatarData?: any;
  avatarDataSmall?: any;
}
export class Avatar implements IAvatar {
  constructor(
    public avatarData?: any,
    public avatarDataSmall?: any
  ) { }
}
