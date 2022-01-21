<template>
  <v-data-table
    :headers="headers"
    :items="items"
    class="elevation-1"
  >
      <template #[`item.asker`]="{ item }">
      {{item.asker.fullName}}
      </template>
      <template #[`item.recieveDate`]="{item}">
        {{persianFormat(item.recieveDate)}}
      </template>
      <template #[`item.fromAccount`]="{item}">
        {{item.fromAccount.account}}
      </template>
      <template #[`item.totalAmount`]="{item}">
        {{item.totalAmount}}<span class="light"> تومان</span>
      </template>
  </v-data-table>
</template>

<script>
export default {
    name:'LoansTable',
    props:{
        items:Array
    },
    data(){
        return{
          headers:[
            {text: 'نام کامل گیرنده',sortable: false,value: 'asker'},
            { text: 'مبلغ کل', value: 'totalAmount' },
            { text: 'تاریخ دریافت',value: 'recieveDate' },
            { text: 'تعداد اقساط',sortable: false, value: 'shareCount' },
            { text: 'از حساب',sortable: false, value: 'fromAccount' }
          ],

        }
    }
}
</script>

<style>

</style>