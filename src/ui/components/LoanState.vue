<template>
    <v-container fluid>
        <v-row class="d-print-none"><v-col><search-bar type="loan" v-model="loan"></search-bar></v-col></v-row>
        <v-row><v-col>
            <v-card v-if="loan!=null">
                <!-- TODO: Also info about sureties -->
                <v-card-title>
                    <v-row no-gutters>
                        <v-col>اطلاعات وام</v-col>
                        <v-btn v-if="loanInfoEdit" @click="loan.number=loanNumberCached;loanInfoEdit=false" rounded outlined text color="error" class="ml-1 d-print-none" small>لغو</v-btn>
                        <v-btn @click="loanInfoEditClick" rounded outlined text :loading="loanInfoEditLoading" color="info" class="d-print-none" small >{{loanInfoEdit?'اعمال':'ویرایش'}}</v-btn>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="3"><strong>گیرنده وام</strong></v-col>
                        <v-col cols="3">{{loan.asker.name+' '+loan.asker.surname}}</v-col>
                    </v-row>
                    <v-row>
                        <v-col><strong>مبلغ کل</strong></v-col>
                        <v-col>{{loan.totalAmount}}<span class="light"> تومان</span></v-col>
                        <v-col><strong>تعداداقساط</strong></v-col>
                        <v-col>{{loan.shareCount}}</v-col>
                    </v-row>
                    <v-row>
                        <v-col><strong>ضامن اول</strong></v-col>
                        <v-col v-if="!loanSuretiesLoading">{{loan.sureties[0].name+' '+loan.sureties[0].surname}}</v-col>
                        <v-col><strong>ضامن دوم</strong></v-col>
                        <v-col v-if="!loanSuretiesLoading">{{loan.sureties[1].name+' '+loan.sureties[1].surname}}</v-col>
                    </v-row>
                    <v-row>
                        <v-col><strong>تاریخ دریافت</strong></v-col>
                        <v-col>{{persianFormat(loan.recieveDate)}}</v-col>
                        <v-col><strong>تاریخ آغاز بازپرداخت</strong></v-col>
                        <v-col>{{persianFormat(loan.payBackStartDate)}}</v-col>
                    </v-row>
                    <v-row><v-col>
                        <v-text-field :rules="[v=>!v || !isNaN(parseInt(v,10))||'شماره را صحیح وارد کنید!',v=>!v || isNaN(parseInt(v,10))||parseInt(v,10)>0 || 'شماره را صحیح وارد کنید!']" :disabled="!loanInfoEdit" v-model="loan.number" label="شماره وام"></v-text-field>
                    </v-col></v-row>
                </v-card-text>
            </v-card>
        </v-col></v-row>
        <v-row><v-col>
            <v-card v-if="loan!=null">
                <v-card-title>
                    <v-row no-gutters>
                        <v-col>وضعیت اقساط</v-col>
                        <v-btn v-if="installmentsEdit" @click="loan.delayedInstallmentNumbers=delayedInstallmentNumsCached;installmentsEdit=false" rounded outlined text color="error" class="ml-1 d-print-none" small>لغو</v-btn>
                        <v-btn @click="loanInstallmentsEditClick" rounded outlined text :loading="installmentsEditLoading" color="info" class="d-print-none" small >{{installmentsEdit?'اعمال':'ویرایش'}}</v-btn>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <v-chip-group light v-model="loan.delayedInstallmentNumbers" multiple column color="error" >
                        <v-chip :disabled="!installmentsEdit || !loan.isSharePast(i)" v-for="i in loan.shareCount" :key="i" :value="i">{{getShareDate(i)}}</v-chip>
                    </v-chip-group>
                    <div style="text-align:left">
                        <v-badge dot inline :color="installmentsEdit?'error':'rgb(252,211,213)'"></v-badge>
                        <span>معوّق</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-col></v-row>
        <v-row v-if="loan!=null" class="d-print-none mt-5" no-gutters>
            <v-col style="text-align:center">
                <v-btn text block :loading="deleting" @click="deleteLoan(false)" color="red darken-1"><span class="body-1 shabnam-font">حذف وام</span></v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn icon @click="print()"><v-icon>mdi-printer</v-icon></v-btn>
            </v-col>
        </v-row>
        <ok-cancel-dialog v-model="confirmDialog.show" :okClick="deleteLoan.bind(true)" :cancelClick="confirmDialog.cancel.bind()" title="آیا مطمئن هستید؟" subtitle="تمام اطلاعات مرتبط نیز پاک خواهد شد.">
        </ok-cancel-dialog>
    </v-container>
</template>

<script>
import SearchBar from './SearchBar';
import OkCancelDialog from '@/ui/components/OkCancelDialog';
import LoanRepo from '@/data/LoanRepo';
import PersonRepo from '@/data/PersonRepo';
export default {
    name:'LoanState',
    components:{SearchBar,OkCancelDialog},
    activated(){
        if(this.$route.query.id){
            if(this.loan && this.loan._id===this.$route.query.id){
                return;
            }
            LoanRepo.GetLoan(this.$route.query.id).then(l=>{
                this.loan=l;
            });
        }
    },
    data(){
        return{
            loan:null,
            delayedInstallmentNumsCached:null,
            installmentsEdit:false,
            installmentsEditLoading:false,
            deleting:false,
            loanNumberCached:null,
            loanInfoEdit:false,
            loanInfoEditLoading:false,
            loanSuretiesLoading:true,
            confirmDialog:{
                show:false,
                cancel:()=>{
                    this.confirmDialog.show=false;
                },
            }
        }
    },
    methods:{
        loanInstallmentsEditClick(){
            if(!this.installmentsEdit){
                this.delayedInstallmentNumsCached=this.loan.delayedInstallmentNumbers.slice();
                this.installmentsEdit=true;
            }else{
                this.installmentsEdit=false;
                this.installmentsEditLoading=true;
                LoanRepo.Update(this.loan).then(()=>{
                    this.installmentsEditLoading=false;
                })
            }
        },
        loanInfoEditClick(){
            if(!this.loanInfoEdit){
                this.loanNumberCached=this.loan.number;
                this.loanInfoEdit=true;
            }else{
                this.loanInfoEdit=false;
                this.loanInfoEditLoading=true;
                LoanRepo.Update(this.loan).then(()=>{
                    this.loanInfoEditLoading=false;
                })
            }
        },
        getShareDate(shareNum){
            let date=this.loan.getShareDate(shareNum);
            return date.format('MMMM YYYY');
        },
        deleteLoan(force=false){
            if(!force){
                this.confirmDialog.show=true;
                return;
            }
            this.deleting=true;
            LoanRepo.Remove({_id:this.loan._id}).then(()=>{
                this.deleting=false;
                this.confirmDialog.cancel();
                this.loan=null;
            });
        },
        print(){
            print();
        }
    },
    watch:{
        loan(nloan){
            if(nloan==null)return;
            if(typeof(nloan.sureties[0])==='string'){
                this.loanSuretiesLoading=true;
                PersonRepo.Get(nloan.sureties[0]).then(p=>{
                    nloan.sureties[0]=p;
                    PersonRepo.Get(nloan.sureties[1]).then(pp=>{
                        nloan.sureties[1]=pp;
                        this.loanSuretiesLoading=false;
                    })
                })
            }
        }
    }

}
</script>

<style scoped>
.shabnam-font{
    font-family: 'Shabnam'!important;
}
</style>