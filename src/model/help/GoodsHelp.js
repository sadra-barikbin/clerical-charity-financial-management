const Help =require("./Help")
module.exports = class GoodsHelp extends Help{
    constructor(items,asker,recieveDate,reason){
        super("GOODS", asker,recieveDate,reason)
        this.items = items
    }
    brief(){
        return Object.assign({items:this.items},super.brief())
    }
}