<template>
    <v-row><v-col>
        <v-subheader>{{title}}</v-subheader>
        <v-simple-table v-if="items.length>0">
            <template #default>
                <thead>
                    <tr>
                        <th>تاریخ دریافت</th>
                        <th>مبلغ وام</th>
                        <th>تعداد اقساط</th>
                        <th>آخرین قسط</th>
                        <th class="text-center">معوّق</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,idx) in items" :key="`${title}${idx}`" style="cursor:pointer" @click="goToLoanState(item)">
                        <td>{{ persianFormat(item.recieveDate) }}</td>
                        <td>{{ item.totalAmount }}<small> تومان</small></td>
                        <td>{{item.shareCount}}</td>
                        <td>{{item.getShareDate(item.shareCount).format("MMMM YYYY")}}</td>
                        <td class="text-center">
                            <span v-if="item.delayedInstallmentNumbers.length==0">-</span>
                            <v-chip v-else color="#e24c41" text-color="white">{{item.delayedInstallmentNumbers.length}} قسط</v-chip>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
        <v-row v-else justify="center">
            <v-chip>هنوز داده‌ای نیست!</v-chip>
        </v-row>
    </v-col></v-row>
</template>

<script>
import LoanRepo from '@/data/LoanRepo';
export default {
    name:'LoansTable',
    created(){
        LoanRepo.GetLoansOf(this.person).then(ls=>{
            this.items=ls;
        });
    },
    props:{
        person:Object
    },
    data(){
        return{
            items:[],
            title:'وام‌های دریافت شده'
        }
    },
    methods:{
        goToLoanState(loan){
            this.$router.replace({path:'loanstate',query:{id:loan._id}});
        }
    }
}
</script>

<style>

</style>