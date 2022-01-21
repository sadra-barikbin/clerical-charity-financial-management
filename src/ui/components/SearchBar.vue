<template>
    <v-autocomplete        
        v-model="model"
        :items="entries"
        :loading="isLoading"
        :search-input.sync="search"
        :color="color"
        hide-no-data
        hide-selected
        :label="label"
        :outlined="outlined"
        item-value="_id"
        placeholder="برای جستجو تایپ کنید"
        :hint="hint"
        prepend-icon="mdi-database-search"
        return-object
        :required="required"
        :rules="rules"
        :dense="dense"
        :disabled="disabled"
        item-disabled="disabled"
        no-filter
    >
      <template #selection="{item}">
            <span v-if="type==='loan'">وام {{item.asker.name+' '+item.asker.surname}} </span>
            <span v-else>{{item.name+' '+item.surname}} </span>
            <span v-if="item.number"> به شماره {{item.number}} </span>
      </template>
      <template #item="{item}">
        <v-list-item-content v-if="'header' in item">
          <v-row>
            <v-col v-if="type==='loan'" style="font-family:Shabnam" class="font-weight-light">گیرنده وام</v-col><v-col v-else style="font-family:Shabnam" class="font-weight-light">نام و نام خانوادگی</v-col>
            <v-col style="font-family:Shabnam" class="font-weight-light">شماره ملّی</v-col>
            <v-col style="font-family:Shabnam" class="font-weight-light"><v-icon size="20">mdi-phone</v-icon>شماره تماس</v-col>
            <v-col v-if="type==='loan'" style="font-family:Shabnam" class="font-weight-light">تاریخ دریافت</v-col>
          </v-row>
        </v-list-item-content>
        <v-row v-else>
          <v-col>
            <span v-if="type==='loan'">{{item.asker.name+' '+item.asker.surname}}</span>
            <span v-else>{{item.name+' '+item.surname}}</span>
          </v-col>
          <v-col>
            {{type==='loan'?item.asker.nationalId:item.nationalId}}
          </v-col>
          <v-col>
            {{type==='loan'?item.asker.phone:item.phone}}
          </v-col>
          <v-col v-if="type==='loan'">
            {{persianFormat(item.recieveDate)}}
          </v-col>
        </v-row>
      </template>
    </v-autocomplete>
</template>

<script>
//TODO: make widget height not to go more than a specific amount
import PersonRepo from '@/data/PersonRepo';
import SchoolRepo from '@/data/SchoolRepo';
import LoanRepo from '@/data/LoanRepo';
import TagRepo from '@/data/TagRepo';
import Loan from '@/model/Loan';
export default {
    name:'SearchBar',
    props:{
        type:{
          type:String,
          default:'person'
        },
        changed:Object,
        rules:Array,
        outlined:Boolean,
        label:String,
        dense:Boolean,
        color:String,
        required:Boolean,
        disabled:Boolean
    },
    data(){
        return{
          isLoading:false,
          search:null,
          model:null,
          entries:[]
        }
    },
    model:{
      prop:'changed',
      event:'search-bar-item-change'
    },
    watch: {
      search (val) {           /**to match'n'skip string having letter and number mixed */
        if (this.isLoading || !val || /\p{L}+[0-9]+|[0-9]+\p{L}+/u.test(val)) return;
        this.isLoading = true;
        PersonRepo.Search(val).then(people=>{
          if(this.type==='person'){
            this.entries=people;
            this.isLoading=false;
          }else{
            LoanRepo.GetLoansOf(people).then(loans=>{
              if(parseInt(val,10)){
                LoanRepo.FindByNumber(val).then(otherLoans=>{
                  let loanIds=new Set(loans.map(l=>l._id));
                  this.entries=[...loans,...otherLoans.filter(ol=>!loanIds.has(ol._id))];    
                  this.isLoading=false;
                }); 
              }else{
                this.entries=loans;
                this.isLoading=false;
              }
            });
          }
        }).catch(e=>{
          console.log(e);
          this.isLoading=false;
        });
        
      },
      entries(nentries){
        if(nentries.length==0 || ('header' in nentries[0])){
          return
        }
        nentries.unshift({'header':null,_id:'-1',disabled:true});
      },
      async model(val){
        if(val && !(val instanceof Loan)){
          if(val.tags.length!=0 && typeof(val.tags[0])==='string'){
            val.tags=await Promise.all(val.tags.map(t=>TagRepo.Get(t)));
          }
          if(('education' in val) && typeof(val.education.school)==='string'){
            val.education.school=await SchoolRepo.Get(val.education.school);
          }
          if(!val.avatar){
            let attach=await PersonRepo.GetAvatarOf(val);
            if(attach){
              val.avatar={data:attach,url:URL.createObjectURL(attach)}
            }
          }
        }
        this.$emit('search-bar-item-change',val);
      },
      changed(n){
        if(n==null){
          this.entries=[];
        }
        this.model=n;
      }
    },
    computed:{
      hint:function(){
        let common="نام فرد,شماره تماس";
        if(this.type=='loan')
          return common+",شماره ملّی یا شماره وام";
        else
          return common+" یا شماره ملّی";
      }
    }
}
</script>

<style>

</style>