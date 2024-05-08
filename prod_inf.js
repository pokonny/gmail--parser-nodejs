class prod_inf{
  constructor( array_info){
  this.sale_id = array_info[0];
  this.name = array_info[1];
  this.quantity_total = array_info[2];
  this.price = array_info[3];
  this.margin_perc = array_info[4];
  this.margin_total= array_info[5];
}


  // Getter methods

  get sale_id() {

    return this._sale_id;

  }



  get name() {

    return this._name;

  }



  get quantity_total() {

    return this._quantity_total;

  }



  get price() {

    return this._price;

  }



  get margin_perc() {

    return this._margin_perc;

  }



  get margin_total() {

    return this._margin_total;

  }



  // Setter methods

  set sale_id(value) {

    this._sale_id = value;

  }



  set name(value) {

    this._name = value;

  }



  set quantity_total(value) {

    this._quantity_total = value;

  }



  set price(value) {

    this._price = value;

  }



  set margin_perc(value) {

    this._margin_perc = value;

  }



  set margin_total(value) {

    this._margin_total = value;

  }

}

module.exports =prod_inf;
