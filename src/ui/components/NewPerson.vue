<template>
    <v-container fluid>
        <v-subheader>مشخصات فرد را وارد کنید</v-subheader>
        <v-form v-model="valid" ref="form" class="pa-2">
            <v-text-field class="pb-2" :loading="nid.dupCheckLoading" :error-messages="nid.dupCheckMsgs" :error="nid.dupCheckError" validate-on-blur required dense v-model="nid.input" :rules="[checkNid]" label="شماره ملی" hint="بدون خط فاصله"></v-text-field>
            <v-layout row style="align-items:center">
                <v-col class="py-0">
                    <v-text-field required dense v-model="name" :rules="[s=> !!s||'این قسمت را خالی نگذارید!']" label="نام"></v-text-field>
                    <v-text-field required dense v-model="surname" :rules="[s=> !!s||'این قسمت را خالی نگذارید!']" label="نام خانوادگی"></v-text-field>
                </v-col>
                <v-col cols="2" class="pa-0" style="text-align:center">
                    <v-avatar color="grey lighten-2" size="96" @click="$refs.avatar.click()" style="cursor:pointer">
                        <input type="file" ref="avatar" v-show="false" @change="uploadAvatar" accept="image/png,image/jpeg">
                        <v-icon v-if="avatar==null" size="x-large">mdi-plus</v-icon>
                        <img v-else :src="avatar.url">
                    </v-avatar>
                </v-col>
            </v-layout>
            <v-text-field dense v-model="fathername" label="نام پدر"></v-text-field>
            <persian-date-field :max="todayString()" v-model="birthDate" label="تاریخ تولد"></persian-date-field>
            <v-layout row wrap align-center>
                <v-col cols="12" sm="1">
                    <v-checkbox dense v-model="married" label="متاهل"></v-checkbox>
                </v-col>
                
                <v-col cols="12" sm="3" class="pr-4">
                    <v-text-field v-if="married" dense required :rules="[v=>/^\d+$/.test(v)||'تعداد را صحیح وارد کنید!']" v-model="childCnt" label="تعداد فرزندان"></v-text-field>
                </v-col>
            </v-layout>
            <v-text-field v-model="phone" dense :rules="[v=>v==null||v===''||/^09[0-9]{9}$/.test(v)||'شماره تماس را صحیح وارد کنید!']" prepend-icon="mdi-phone" label="شماره تماس"></v-text-field>
            <v-textarea required v-model="address" dense label="آدرس" rows="2" prepend-icon="mdi-map-marker"> </v-textarea>
            <v-radio-group dense v-model="gender" :rules="[s=> !!s||'جنسیت فرد را انتخاب کنید!']" row>
                <template v-slot:label>
                    <span>جنسیت</span>
                </template>
                <v-radio label="مذکر" value="male"></v-radio>
                <v-radio label="مونث" value="female"></v-radio>
            </v-radio-group>
            <v-checkbox dense v-model="student" label="طلبه"></v-checkbox>
            <v-slider dense :min="1" :max="11" v-if="student" label="پایه تحصیلی" ticks="always" v-model="studentLevel" :thumb-size="46" thumb-label="always">
                <template v-slot:thumb-label="{ value }">
                    <template v-if="value<4">سطح۱</template>
                    <template v-else-if="value<6">سطح۲</template>
                    <template v-else-if="value<11">سطح۳</template>
                    <template v-else>سطح۴</template>
                    <template v-if="value<11">
                        <br/>
                    پایه {{value}}
                    </template>
                </template>
            </v-slider>
            <v-select v-if="student" :rules="[s=> !!s||'یک مورد را انتخاب کنید!']" dense v-model="studentAttitude" :items="availableStudentAttitudes" label="انضباط"></v-select>
            <v-select v-if="student" :rules="[s=> !!s||'یک مدرسه را انتخاب کنید!']" dense v-model="studentSchool" :items="availableSchools" label="مدرسه" hint="محل تحصیل" persistent-hint></v-select>
            <v-checkbox v-if="student" dense v-model="studentGetsIntenciveTuition" label="شهریه تشویقی می‌گیرد"></v-checkbox>
            <v-select dense v-model="tags" :items="availableTags" label="برچسب ها" multiple chips hint="ویژگی های این فرد چیست؟" persistent-hint></v-select>
            <v-btn @click="newPerson" :disabled="!valid || working" color="success" class="mt-3">ایجاد</v-btn>
        </v-form>
    </v-container>
</template>

<script>
import PersonRepo from '@/data/PersonRepo';
import SchoolRepo from '@/data/SchoolRepo';
import TagRepo from '@/data/TagRepo';
import Person from '@/model/Person';
import Student from '@/model/Student';
import Education from '@/model/Education';
import ItemAlreadyExistsError from '@/errors/ItemAlreadyExistsError';
import PersianDateField from '@/ui/components/PersianDateField';
export default {
    name:'NewPerson',
    components:{
        PersianDateField
    },
    activated(){
        SchoolRepo.GetSchools().then(ss=>{
            this.availableSchools=ss.map(x=>{return {text:x.school,value:x}});
        });
        TagRepo.GetTags().then(ss=>{
            this.availableTags=ss.map(x=>{return {text:x.tag,value:x}});
        });
    },
    data(){
        return{
            name:null,
            surname:null,
            avatar:null,
            fathername:null,
            nid:{
                input:null,
                dupCheckMsgs:null,
                dupCheckError:false,
                dupCheckLoading:false
            },
            tags:[],
            valid:false,
            availableTags:[],
            availableSchools:[],
            availableStudentAttitudes:[
                {text:"متوسط",value:"MIDDLE"},
                {text:"خوب",value:"GOOD"},
                {text:"عالی",value:"PERFECT"}],
            married:false,
            student:false,
            gender:'male',
            childCnt:0,
            phone:null,
            address:null,
            birthDate:null,
            studentLevel:1,
            studentAttitude:null,
            studentSchool:null,
            studentGetsIntenciveTuition:false,
            working:false
        }
    },
    methods:{
        newPerson(){
            let person;
            if(!this.student){
                person=new Person(this.nid.input,this.name,this.surname,this.fathername,this.birthDate,this.married,parseInt(this.childCnt,10),this.gender,this.address,this.phone,this.tags,this.avatar?.data);
            }else{
                person=new Student(this.nid.input,this.name,this.surname,this.fathername,this.birthDate,this.married,parseInt(this.childCnt,10),this.gender,this.address,this.phone,this.tags,this.avatar?.data);
                person.setEducation(new Education(this.studentLevel,this.studentSchool,this.studentAttitude,this.studentGetsIntenciveTuition))
            }
            this.working=true;
            PersonRepo.Put(person)
            .then(()=>{
                this.showMessageBox({type:'info',buttons:['باشه'],title:'فرد جدید',message:'با موفقیت اضافه شد!'});
                this.$refs.form.reset();
                this.avatar = null;
                this.working = false;
                this.gender = 'male';
            })
            .catch(e=>{
                if(e instanceof ItemAlreadyExistsError){
                    let item=e.existingItem;
                    this.showMessageBox({type:'error',buttons:['باشه'],title:'فرد جدید',message:`این شماره ملی قبلا با نام '${item.name} ${item.surname}' !ثبت شده است`});
                    this.nid.input=null;
                    this.working=false;
                }
            })
        },
        uploadAvatar({target}){
            let file=target.files[0];
            let size=file.size/1024/1024;
            if(size>0.5){
                this.showMessageBox({type:'error',buttons:['باشه'],title:'فرد جدید',message:'حجم عکس باید کمتر از نیم مگابایت باشد!'});
                return;
            }
            let imageURL=URL.createObjectURL(file);
            this.avatar={data:file,url:imageURL};
        },
        checkNid(v){
            this.nid.dupCheckError=false;
            this.nid.dupCheckMsgs=[];
            if(!/^[0-9]{10}$/.test(v)){
                return 'شماره ملی را صحیح وارد کنید!';
            }
            this.nid.dupCheckLoading=true;
            PersonRepo.NidExists(v).then(r=>{
                this.nid.dupCheckLoading=false;
                if(r.exists){
                    this.nid.dupCheckError=true;
                    this.nid.dupCheckMsgs=[`این شماره ملی قبلا با نام '${r.name} ${r.surname}' ثبت شده است!`];
                }
            })
            return true;
        }
    }
}
</script>

<style>

</style>