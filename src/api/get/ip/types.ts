export class GetIp {
    ip: string;
    country: string;
    city:string;
    address:  string;
    

    constructor(
      ip:string,
      country: string,
      city:string,
      address:  string,
    ) {
      this.ip = ip;
      this.country = country;
      this.city = city;
      this.address = address;
    }
}