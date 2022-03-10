export interface IUser {
    playerId?: string;
    name?: string;
    surname?: string;
    nickname?: string;
    language?: string;
    mail?: string;
    avatar?: string;
    territoryId?: string;
}
export class User implements IUser {
    constructor(
        public playerId?: string,
        public name?: string,
        public surname?: string,
        public nickname?: string,
        public language?: string,
        public mail?: string,
        public avatar?: string,
        public territoryId?: string
    ) { }
}