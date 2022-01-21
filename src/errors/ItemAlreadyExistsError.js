module.exports=class ItemAlreadyExistsError{
    constructor(existingItem){
        this.existingItem=existingItem;
    }
}