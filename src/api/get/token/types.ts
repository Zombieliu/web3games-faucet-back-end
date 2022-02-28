export class GetToken {
    address:  string;
    ip: string;
    country: string;
    city:string;
    update_time:string;
    

    constructor(
      address:  string,
      ip:string,
      country: string,
      city:string,
      update_time:string,
    ) {
      this.address = address;
      this.ip = ip;
      this.country = country;
      this.city = city;
      this.update_time= update_time;
    }
}