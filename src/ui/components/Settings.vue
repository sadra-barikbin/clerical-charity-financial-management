<template>
    <v-container fluid>
        <v-row align="start">
            <v-col  xs12 sm5 v-for="(section,sectionIdx) in sections" :key="section.type">
                <v-list rounded elevation="3">
                    <v-subheader>{{section.title}}</v-subheader>
                    <v-list-item v-for="(item,i) in section.stuff" :key="item._id">
                        <v-list-item-content>
                            <v-list-item-title>{{item[section.type]}}</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action >
                            <v-btn icon @click="deleteStuff(i,sectionIdx,false)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="newStuffSectionIdx=sectionIdx;newStuffDialog=true" input-value="true" color="info">
                        <v-list-item-content>
                            <v-list-item-title>{{section.newItemTitle}}</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-icon>
                            <v-icon>mdi-plus</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
        <v-row><v-col>
            <v-card :loading="statLoading">
                <v-card-title>داده‌ها</v-card-title>
                <v-card-text v-if="!statLoading">
                    <v-row align="center">
                        <v-col><strong class="title shabnam-font">افراد</strong></v-col>
                        <v-col><span class="display-2 shabnam-font">{{stat.people.total}}</span><span class="text--secondary"> نفر</span></v-col>
                        <v-col><strong class="title shabnam-font">وام‌ها</strong></v-col>
                        <v-col><span class="display-2 shabnam-font">{{stat.loans.total}}</span><span class="text--secondary"> فقره</span></v-col>
                    </v-row>
                    <v-row><v-col>
                        <v-btn text block color="error" @click="deleteStuff(undefined,'data',false)"><span class="body-1 shabnam-font">حذف تمامی اطلاعات</span></v-btn>
                    </v-col></v-row>
                </v-card-text>
            </v-card>
        </v-col></v-row>
        <v-row v-if="isElectron">
            <v-col>
                <v-btn color="secondary" block :loading="backingUp.running" :disabled="backingUp.dialog" @click="backupDialog=true"><v-icon>mdi-briefcase-download</v-icon>پشتیبان‌گیری اطلاعات</v-btn>
            </v-col>
            <v-col>
                <v-btn color="accent" block :loading="restoring.running" :disabled="restoring.dialog" @click="doRestore()" ><v-icon>mdi-backup-restore</v-icon>بازنشانی اطلاعات</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                نسخه {{version}}
            </v-col>
        </v-row>
        <ok-cancel-dialog v-model="backupDialog" :okClick="backup" :cancelClick="resetBackupDialog" :okDisabled="backingUp.dialog" :cancelDisabled="backingUp.dialog" title="پشتیبان‌گیری" maxWidth="340">
            <template #text>
                <v-checkbox v-model="backupJustPeople" label="تنها از افراد و برچسب‌ها پشتیبان بگیر!"></v-checkbox>
            </template>
        </ok-cancel-dialog>
        <ok-cancel-dialog v-model="newStuffDialog" :okClick="newStuff" :cancelClick="resetNewStuffDialog" :okDisabled="!newStuffName|| newStuffSectionIdx==2 && (!sections[2].number|| !/^[0-9-]+$/.test(sections[2].number))" :title="`اضافه‌کردن ${newStuffSectionIdx==0?'مدرسه':newStuffSectionIdx==1?'برچسب':'حساب'} جدید`" :subtitle="`${newStuffSectionIdx==0?'نام مدرسه':newStuffSectionIdx==1?'عنوان برچسب':'اطلاعات حساب'} را بنویسید.`">
            <template #text>
                <v-text-field ref="newStuffName" dense solo filled autofocus :placeholder="newStuffSectionIdx==0?'نام مدرسه':newStuffSectionIdx==1?'عنوان برچسب':'نام بانک'" :error="newStuffDialogError!=null" :error-messages="newStuffDialogError" v-model="newStuffName"></v-text-field>
                <v-text-field ref="newStuffNumberJustForBankAccount" v-if="newStuffSectionIdx==2" :rules="[s=>/^[0-9-]+$/.test(s)||'شماره حساب را صحیح وارد کنید!']" dense solo filled placeholder="شماره حساب" v-model="sections[2].number"></v-text-field>
            </template>
        </ok-cancel-dialog>
        <ok-cancel-dialog v-model="confirmDialog" :okClick="deleteStuff.bind(null,confirmDialogOn,confirmDialogSectionIdx,true)" :cancelClick="resetConfirmDialog" title="آیا مطمئن هستید؟" :subtitle="confirmDialogMessage">
            <template #text>
                <v-checkbox ref="newStuffNumberJustForTag" v-if="confirmDialogSectionIdx==1" v-model="sections[1].deleteDepends" dense label="افراد با این برچسب را هم پاک کن."> </v-checkbox>
            </template>
        </ok-cancel-dialog>
    </v-container>
  
</template>

<script> 
import {Erase,Backup,Restore} from '@/data/Database';
import Statistics from '@/model/Statistics';
import OkCancelDialog from '@/ui/components/OkCancelDialog';
import SchoolRepo from '@/data/SchoolRepo';
import BankAccountRepo from '@/data/BankAccountRepo';
import TagRepo from '@/data/TagRepo';
import ItemAlreadyExistsError from '@/errors/ItemAlreadyExistsError';
import UnremovableDueToDependenciesError from '@/errors/UnremovableDueToDependenciesError';
export default {
    name:'Settings',
    components:{
        OkCancelDialog
    },
    created(){
        this.getData();
        this.getStat();
        this.isElectron = process.env.IS_ELECTRON;
        this.version = require('electron').remote.app.getVersion();
    },
    activated(){
        this.getStat();
    },
    data(){
        return{
            newStuffName: null,
            newStuffDialog: false,
            newStuffSectionIdx: null,
            newStuffDialogError: null,
            confirmDialog: false,
            confirmDialogMessage: null,
            confirmDialogSectionIdx: null,
            confirmDialogOn: null,
            sections:[
                {title:'مدرسه‌ها', newItemTitle:'مدرسه جدید',stuff:[], type:'school'},
                {title:'برچسب‌ها', newItemTitle:'برچسب جدید', stuff:[], type:'tag',
                deleteDepends:false},
                {title:'حساب‌های بانکی', newItemTitle:'حساب جدید', stuff:[],
                type:'account', number:null}
            ],
            stat: null,
            statLoading: true,
            backupFile: null,
            backingUp: {dialog:false, running:false},
            backupDialog: false,
            backupJustPeople: false,
            restoring: {dialog:false, running:false},
            isElectron: null,
            version: null
        }
    },
    methods:{
        deleteStuff(index, sectionIdx, force){
            if(sectionIdx === 'data'){
                if(!force){
                    this.confirmDialogMessage = "اطلاعات تمامی افراد,وام‌ها,کمک‌ها و نماز-روزه‌ها پاک خواهد شد.";
                    this.confirmDialog = true;
                    this.confirmDialogSectionIdx = 'data';
                    return;
                }else{
                    Erase().then(r=>{
                        console.log(r);
                        this.resetConfirmDialog();    
                    })
                    return;
                }
            }
            let section = this.sections[sectionIdx];
            var item = section.stuff[index];
            let repo = section.type === 'school' ? SchoolRepo : 
                       section.type === 'tag'    ? TagRepo : BankAccountRepo;
            repo['Remove' + section.type.charAt(0).toUpperCase() + 
                 section.type.slice(1)](item, force,
                                        (section.type === 'tag') ? 
                                        section.deleteDepends : undefined)
                .then(()=>{
                    section.stuff.splice(index, 1);
                    if(force){
                        this.resetConfirmDialog();
                    }
            }).catch(e=>{
                if(e instanceof UnremovableDueToDependenciesError){
                    this.confirmDialogMessage = '';
                    for(const [i, dependType] of e.dependencies.entries()){
                        if(i > 0){
                            this.confirmDialogMessage += 'همچنین ';
                        }
                        this.confirmDialogMessage += dependType.message;
                    }
                    this.confirmDialogMessage += "در صورت ادامه اطلاعات آن‌ها نیز پاک خواهد شد.";
                    this.confirmDialogOn = index;
                    this.confirmDialog = true;
                    this.confirmDialogSectionIdx = sectionIdx;
                }
            })
        },
        newStuff(){
            let section = this.sections[this.newStuffSectionIdx];
            let repo = (section.type === 'school') ? 
                        SchoolRepo : (section.type === 'tag') ?
                         TagRepo : BankAccountRepo;
            repo.Put(this.newStuffName + (section.type === 'account' ?
                                            ` ${section.number}` : ''))
                .then(r => {
                    r[section.type] = this.newStuffName + 
                        ((section.type === 'account') ? ` ${section.number}` : '');
                    section.stuff.push(r);
                    this.resetNewStuffDialog();
            }).catch(e => {
                if(e instanceof ItemAlreadyExistsError){
                    let typename = (section.type === 'school') ?
                                    'مدرسه' : (section.type === 'account') ?
                                    'حساب' : 'برچسب';
                    this.newStuffDialogError = `این ${typename} وجود دارد!`;
                }
            });
        },
        resetNewStuffDialog(){
            this.$refs.newStuffName.reset();
            if(this.newStuffSectionIdx == 2){
                this.$refs.newStuffNumberJustForBankAccount.reset();
            }
            this.newStuffDialogError = null;
            this.newStuffDialog = false;
            this.newStuffSectionIdx = null;
        },
        resetConfirmDialog(){
            this.confirmDialogSectionIdx = null;
            this.confirmDialogMessage = null;
            this.confirmDialogOn = null;
            this.confirmDialog = false;
            if(this.newStuffSectionIdx == 1){
                this.$refs.newStuffNumberJustForTag.reset();
            }
        },
        backup(){
            this.backingUp.dialog = true;
            this.showOpenDialog({title:'مسیر ذخیره فایل پشتیبان را انتخاب کنید!',
            properties:['openDirectory']}, ps => {
                if(!ps) return;
                this.backingUp.running = true;
                Backup(ps[0], this.backupJustPeople).then(()=>{
                    this.backingUp.dialog = false;
                    this.backingUp.running = false;
                    this.resetBackupDialog();
                    this.showMessageBox({type:'info', buttons:['باشه'],
                        title:'پشتیبان‌گیری', message:'با موفقیت انجام شد!'});
                });
            });
        },
        doRestore(){
            this.restoring.dialog = true;
            this.showOpenDialog({title:'فایل پشتیبان را انتخاب کنید!',
                filters:[{name:'dump file', extensions:['dump']}]},
                ps => {
                    this.restoring.dialog = false;
                    if(!ps) return;
                    this.restoring.running = true;
                    Restore(ps[0]).then(() => {
                        this.getStat().then(() => {
                            this.getData().then(() => {
                                this.restoring.running = false;
                                this.showMessageBox({type:'info', buttons:['باشه'],
                                    title:'بازنشانی',
                                    message:'با موفقیت انجام شد!'});
                            })
                        })
                    });
                }
            );
        },
        resetBackupDialog(){
            this.backupDialog = false;
            this.backupJustPeople = false;
        },
        getStat(){
            return Statistics.GetGeneralStats().then(r => {
                this.stat = r;
                this.statLoading = false;
            });
        },
        getData(){
            let loads = [];
            for(let [i,f] of [SchoolRepo.GetSchools, TagRepo.GetTags,
                              BankAccountRepo.GetAccounts].entries()){
                loads.push(f().then(r => {
                    this.sections[i].stuff = r;
                }));
            }
            return Promise.all(loads);
        }
    }
}
</script>

<style scoped>
.shabnam-font{
    font-family: 'Shabnam'!important;
}
</style>