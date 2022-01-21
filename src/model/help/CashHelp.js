const Help =require("./Help")
module.exports = class CashHelp extends Help{
    constructor(amount, account, asker, recieveDate, reason){
        super('CASH', asker, recieveDate, reason)
        this.fromAccount = account
        this.amount = amount
    }
    brief(){
        return Object.assign({fromAccount:this.fromAccount._id,
                              amount:this.amount},super.brief())
    }
}