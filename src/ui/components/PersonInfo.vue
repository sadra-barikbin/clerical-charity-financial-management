<template>
    <v-col>
        <v-card>
            <v-card-title>
                اطلاعات هویتی
                <v-spacer></v-spacer>
                <v-btn @click="person=personCachedWhileEdit;personInfo.edit=false" v-if="personInfo.edit" rounded outlined text color="error" class="ml-1 d-print-none" small>لغو</v-btn>
                <v-btn @click="personInfoEditClick" :disabled="personEdu.edit || !personInfo.editValid" rounded outlined text :loading="personInfo.loading" class="d-print-none" color="info" small >{{personInfo.edit?'اعمال':'ویرایش'}}</v-btn>
            </v-card-title>
            <v-card-text>
                <v-form v-model="personInfo.editValid">
                    <v-row align="center" dense>
                        <v-col>
                            <v-text-field v-model="person.name" :disabled="!personInfo.edit" label="نام" :rules="[s=> !!s||'این قسمت را خالی نگذارید!']" ></v-text-field>
                            <v-text-field v-model="person.surname" :disabled="!personInfo.edit" label="نام خانوادگی" :rules="[s=> !!s||'این قسمت را خالی نگذارید!']" ></v-text-field>
                        </v-col>
                        <v-col cols="2" style="text-align:center">
                            <v-avatar color="grey lighten-2" size="96" @click="personInfo.edit && $refs.avatar.click()" :style="{cursor:personInfo.edit?'pointer':undefined}">
                                <input type="file" ref="avatar" v-show="false" @change="uploadAvatar" accept="image/png,image/jpeg">
                                <img v-if="person.avatar" :src="person.avatar.url">
                                <v-icon v-else-if="personInfo.edit" size="x-large">mdi-plus</v-icon>
                                <span v-else>بدون عکس</span>
                                
                            </v-avatar>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col>
                            <v-text-field v-model="person.fathername" :disabled="!personInfo.edit" label="نام پدر"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field v-model="person.nationalId" :disabled="!personInfo.edit" label="شماره ملی" :rules="[v=>/^[0-9]{10}$/.test(v)||'شماره ملی را صحیح وارد کنید!']" ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col>
                            <persian-date-field v-model="person.birthDate" :disabled="!personInfo.edit" label="تاریخ تولد" :max="todayString()" ></persian-date-field>
                        </v-col>
                        <v-col>
                            <v-text-field v-model="person.phone" :disabled="!personInfo.edit" label="شماره تماس" :rules="[v=>(v==null)||(v==='')||/^09[0-9]{9}$/.test(v)||'شماره تماس را صحیح وارد کنید!']" ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col>
                            <v-checkbox v-model="person.married" :disabled="!personInfo.edit" label="متاهل"></v-checkbox>
                        </v-col>
                        <v-col >
                            <v-text-field v-if="person.married" dense v-model="person.childCount" :disabled="!personInfo.edit" label="تعداد فرزندان" :rules="[v=>/^\d+$/.test(v)||'تعداد را صحیح وارد کنید!']" ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col>
                            <v-radio-group v-model="person.gender" :disabled="!personInfo.edit" row :rules="[s=> !!s||'جنسیت فرد را انتخاب کنید!']" >
                                <template v-slot:label>
                                    <span>جنسیت</span>
                                </template>
                                <v-radio label="مذکر" value="male"></v-radio>
                                <v-radio label="مونث" value="female"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col>
                            <v-textarea v-model="person.address" :disabled="!personInfo.edit" label="آدرس" rows="2" prepend-icon="mdi-map-marker"> </v-textarea>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col>
                            <v-select v-model="person.tags" :disabled="!personInfo.edit" :items="availableTags" label="برچسب ها" multiple chips hint="ویژگی های این فرد" persistent-hint></v-select>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
        <br/>
        <v-card>
            <v-card-title>
                اطلاعات تحصیلی
                <v-spacer></v-spacer>
                <v-btn @click="personEduEditCancelClick" v-if="personEdu.edit" rounded outlined text color="error" class="ml-1 d-print-none" small>لغو</v-btn>
                <v-btn @click="personEduEditClick" :disabled="personInfo.edit || !personEdu.editValid" rounded outlined text :loading="personEdu.loading" color="info" class="d-print-none" small >{{personEdu.edit?'اعمال':'ویرایش'}}</v-btn>
            </v-card-title>
            <v-card-text>
                <v-form v-model="personEdu.editValid">
                    <v-row dense justify="center" v-if="!('education' in person)"><v-chip>او طلبه نیست!</v-chip></v-row>
                    <v-row dense>
                        <v-col v-if="personEdu.edit"><v-checkbox v-model="personEdu.isStudent" label="طلبه"></v-checkbox></v-col>                        
                        <v-col v-if="'education' in person"><v-checkbox v-model="person.education.getsIncentiveTuition" :disabled="!personEdu.edit || !personEdu.isStudent" label="شهریه تشویقی می‌گیرد"></v-checkbox></v-col>
                    </v-row>
                    <v-row dense v-if="'education' in person">
                        <v-col>
                            <v-slider v-model="person.education.level" :disabled="!personEdu.edit || !personEdu.isStudent" :min="1" :max="11" label="پایه تحصیلی" ticks="always" :thumb-size="46" thumb-label="always">
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
                                <template v-if="!personEdu.edit" #append>
                                    <template v-if="person.education.level==11">خارج</template>
                                    <template v-else>پایه{{person.education.level}}</template>
                                </template>
                            </v-slider>
                        </v-col>
                    </v-row>
                    <v-row dense v-if="'education' in person">
                        <v-col>
                            <v-select v-model="person.education.attitude" :disabled="!personEdu.edit || !personEdu.isStudent" :rules="[s=> !!s||'یک مورد را انتخاب کنید!']" :items="availableStudentAttitudes" label="انضباط"></v-select>
                        </v-col>
                        <v-col>
                            <v-select v-model="person.education.school" :disabled="!personEdu.edit || !personEdu.isStudent" :rules="[s=> !!s||'یک مدرسه را انتخاب کنید!']" :items="availableSchools" label="مدرسه" hint="محل تحصیل" persistent-hint></v-select>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-col>
</template>

<script>
import PersianDateField from './PersianDateField';
import PersonRepo from '@/data/PersonRepo';
import TagRepo from '@/data/TagRepo';
import SchoolRepo from '@/data/SchoolRepo';
const Education=require('@/model/Education');
const Person=require('@/model/Person');
const Student=require('@/model/Student');
export default {
    name:'PersonInfo',
    components:{PersianDateField},
    activated(){
        SchoolRepo.GetSchools().then(ss=>{
            this.availableSchools=ss.map(x=>{return {text:x.school,value:x}});
        });
        TagRepo.GetTags().then(ss=>{
            this.availableTags=ss.map(x=>{return {text:x.tag,value:x}});
        });
    },
    mounted(){
        SchoolRepo.GetSchools().then(ss=>{
            this.availableSchools=ss.map(x=>{return {text:x.school,value:x}});
        });
        TagRepo.GetTags().then(ss=>{
            this.availableTags=ss.map(x=>{return {text:x.tag,value:x}});
        });
    },
    props:{
        personProp:Object
    },
    model:{
      prop:'personProp',
      event:'person-change'
    },
    data(){
        return{
            person:this.personProp,
            personCachedWhileEdit:null,
            personInfo:{edit:false,loading:false,editValid:false},
            personEdu:{edit:false,loading:false,isStudent:null,editValid:false},
            availableSchools:[],
            availableTags:[],
            availableStudentAttitudes:[
                {text:"متوسط",value:"MIDDLE"},
                {text:"خوب",value:"GOOD"},
                {text:"عالی",value:"PERFECT"}],
        }
    },
    methods:{
        personInfoEditClick(){
            if(!this.personInfo.edit){
                this.personInfo.edit=true;
                this.personCachedWhileEdit=this.person.copy();
            }else{
                console.log(this.person);
                this.personInfo.edit=false;
                this.personInfo.loading=true;
                PersonRepo.Update(this.person).then(()=>{
                    this.personInfo.loading=false;
                }).catch(e=>{
                    console.log(e);
                });
            }
        },
        personEduEditClick(){
            if(!this.personEdu.edit){
                this.personEdu.edit=true;
                this.personEdu.isStudent='education' in this.person;
                this.personCachedWhileEdit=this.person.copy();
                if(!this.personEdu.isStudent){
                    this.person.education=new Education();
                }
            }else{
                this.personEdu.edit=false;
                this.personEdu.loading=true;
                if(this.personEdu.isStudent && !('education' in this.personCachedWhileEdit)){
                    this.person=Object.assign(new Student,this.person);
                }else if(!this.personEdu.isStudent && ('education' in this.personCachedWhileEdit)){
                    delete this.person.education;
                    this.person=Object.assign(new Person,this.person);
                }
                if('childCount' in this.person) this.person.childCount=parseInt(this.person.childCount,10);
                PersonRepo.Update(this.person).then(()=>{
                    this.personEdu.loading=false;
                }).catch(e=>{
                    console.log(e);
                });
            }
        },
        personEduEditCancelClick(){
            if('education' in this.personCachedWhileEdit){
                this.person.education=this.personCachedWhileEdit.education.copy();
            }else{
                delete this.person.education;
            }
            this.personEdu.edit=false
        },
        uploadAvatar({target}){
            let file=target.files[0];
            let size=file.size/1024/1024;
            if(size>0.5){
                this.showMessageBox({type:'error',buttons:['باشه'],title:'فرد جدید',message:'حجم عکس باید کمتر از نیم مگابایت باشد!'});
                return;
            }
            let imageURL=URL.createObjectURL(file);
            this.person.avatar={data:file,url:imageURL};
        }
    },
    computed:{
        editing:function(){
            return this.personEdu.edit||this.personInfo.edit||
                this.personInfo.loading||this.personEdu.loading;
        },
    },
    watch:{
        editing(nedit){
            this.$emit('edit',nedit);
        },
        person(nperson){
            this.$emit('person-change',nperson);
        },
        personProp(npp){
            this.person=npp;
        }
    }

}
</script>

<style>

</style>