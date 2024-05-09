class prod_inf{
  constructor( array_info){
  this.name = array_info[0];
  this.quantity_total = array_info[1];
  this.prod_type = array_info[2];
  this.size = array_info[3];
  this.margin_perc = array_info[4];
  this.price = array_info[5];
  this.margin_total= array_info[6];

}
}
module.exports = prod_inf;
