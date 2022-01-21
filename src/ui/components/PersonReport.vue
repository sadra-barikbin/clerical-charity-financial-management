<template>
    <v-layout column>
        <v-col class="d-print-none"><search-bar v-model="person" :disabled="editing" ></search-bar></v-col>
        <person-info v-if="person!=null" v-on:edit="editing=$event" v-model="person"></person-info>
        <person-stat v-if="person!=null" :person="person"></person-stat>
        <v-col v-if="person!=null" class="d-print-none">
            <v-row no-gutters>
                <v-col style="text-align:center" >
                    <v-btn text block :loading="deleting" @click="deletePerson(false)" color="red darken-1"><span class="body-1 shabnam-font">حذف فرد</span></v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn icon @click="print()"><v-icon>mdi-printer</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-col>
        <ok-cancel-dialog v-model="confirmDialog" :okClick="deletePerson.bind(true)" :cancelClick="cancelDialog" title="آیا مطمئن هستید؟" subtitle="تمام اطلاعات مرتبط نیز پاک خواهد شد.">
        </ok-cancel-dialog>
    </v-layout>
</template>

<script>
import PersonRepo from '@/data/PersonRepo';
import SearchBar from './SearchBar';
import PersonInfo from './PersonInfo';
import PersonStat from './PersonStat';
import OkCancelDialog from '@/ui/components/OkCancelDialog';
export default {
    name:'PersonReport',
    components:{SearchBar,PersonInfo,PersonStat,OkCancelDialog},
    data(){
        return{
            person:null,
            editing:false,
            deleting:false,
            confirmDialog:false
        }
    },
    methods:{
        deletePerson(force){
            if(!force){
                this.confirmDialog=true;
                return;
            }
            this.deleting=true;
            PersonRepo.Remove(this.person).then(()=>{
                this.deleting=false;
                this.person=null;
                this.cancelDialog();
            });
        },
        cancelDialog(){
            this.confirmDialog=false;
        },
        print(){
            print();
        },
    }
}
</script>

<style scoped>
.shabnam-font{
    font-family: 'Shabnam'!important;
}
</style>