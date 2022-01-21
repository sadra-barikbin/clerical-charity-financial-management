module.exports=class UnremovableDueToDependenciesError{
    constructor(dependencies){
        this.dependencies=dependencies;
    }
}