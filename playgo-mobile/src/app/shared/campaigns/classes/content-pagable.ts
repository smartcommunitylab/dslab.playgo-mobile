export class ContentPagable {

  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
  empty?: boolean;
  content?: [];
  pagable?: {};
  sort?: {};

  constructor(totalPages,number){
    this.totalPages = totalPages;
    this.number = number;
  }

}
