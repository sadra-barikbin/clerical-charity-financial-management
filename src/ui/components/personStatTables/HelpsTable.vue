<template>
    <v-row><v-col>
        <v-subheader>{{title}}</v-subheader>
        <v-simple-table v-if="items.length>0">
            <template #default>
                <thead>
                    <tr>
                        <th>تاریخ دریافت</th>
                        <th>مبلغ/کالا</th>
                        <th>از حساب</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,idx) in items" :key="`${title}${idx}`">
                        <td>{{ persianFormat(item.recieveDate) }}</td>
                        <td v-if="item.type === 'CASH'">{{ item.amount }}<small> تومان</small></td>
                        <td v-else>{{item.items}}</td>
                        <td v-if="item.type === 'CASH'">{{item.fromAccount.account}}</td>
                        <td v-else>--</td>
                        <td><v-btn icon @click="deleteHelp(idx,false)"><v-icon dense color="#EF5373">delete</v-icon></v-btn></td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
        <v-row v-else justify="center">
            <v-chip>هنوز داده‌ای نیست!</v-chip>
        </v-row>
        <ok-cancel-dialog v-model="deleteConfirmDialog.show" :okClick="deleteHelp.bind(null,deleteConfirmDialog.index,true)" :cancelClick="cancelDeleteConfirmDialog" title="آیا مطمئن هستید؟">
        </ok-cancel-dialog>
    </v-col></v-row>
</template>

<script>
import HelpRepo from '@/data/HelpRepo';
import OkCancelDialog from '@/ui/components/OkCancelDialog';
export default {
    name:'HelpsTable',
    components:{OkCancelDialog},
    created(){
        HelpRepo.GetHelpsOf(this.person).then(ls=>{
            this.items=ls;
        });
    },
    props:{
        person:Object
    },
    data(){
        return{
            items:[],
            title:'کمک‌های دریافت شده',
            deleteConfirmDialog:{
                show:false,index:null
            }
        }
    },
    methods:{
        deleteHelp(idx,force=false){
            if(!force){
                this.deleteConfirmDialog.show=true;
                this.deleteConfirmDialog.index=idx;
                return;
            }
            HelpRepo.RemoveHelp(this.items[idx]).then(()=>{
                this.items.splice(idx,1);
                this.cancelDeleteConfirmDialog();
            });
        },
        cancelDeleteConfirmDialog(){
            this.deleteConfirmDialog.show=false;
            this.deleteConfirmDialog.index=null;
        }
    }
}
</script>

<style>

</style>