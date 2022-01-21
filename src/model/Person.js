const ValueError=require('../errors/ValueError')
module.exports=class Person {
	constructor(nationalId,name,surname,fathername,birthDate,married,childCount,gender,address,phone,tags,avatar){
		if(nationalId!=undefined && typeof nationalId !== 'string'){
			throw new TypeError()
		}
		if(nationalId!=undefined && !/^[0-9]{10}$/.test(nationalId)){
			throw new ValueError("Bad national number format")
		}
		this.nationalId=nationalId
		this.name=name
		this.surname=surname
		this.fathername=fathername
		this.birthDate=birthDate
		this.married=married
		this.childCount=married?childCount:0
		this.gender=gender
		this.phone=phone
		this.address=address
		this.tags=tags
		this.avatar=avatar
	}
	get fullName(){
		return `${this.name} ${this.surname}`
	}
	brief(){
		return {
			nationalId:this.nationalId,
			name:this.name,
			surname:this.surname,
			tags:this.tags.map(tag=>tag._id),
			fathername:this.fathername,
			birthDate:this.birthDate,
			married:this.married,
			childCount:this.childCount,
			gender:this.gender,
			phone:this.phone,
			address:this.address,
			//Intentionally I didnt put 'avatar' in the brief due to technicality of Pouchdb
			//and I dont know if this violates model design rules.
		}
	}
	copy(){
		let temp=Object.assign(new Person,this);
		temp.tags=temp.tags.map(tag=>Object.assign({},tag))
		if(temp.avatar){
			let avatarCopy=temp.avatar.data.slice();
			temp.avatar={data:avatarCopy,url:URL.createObjectURL(avatarCopy)};
		}
		//ٌWarning: what if birthDate type is date?then you're copying refrence
		return temp;
	}
}
