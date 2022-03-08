export interface ITerritory {
    territoryId: string;
    name: string;
}
export class Territory implements ITerritory {
    constructor(
        public territoryId: string,
        public name: string) { }
}

