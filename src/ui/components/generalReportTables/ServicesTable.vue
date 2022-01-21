<template>
   <v-data-table
    :headers="headers"
    :items="items"
    class="elevation-1"
  >
      <template #[`item.performer`]="{item}">
        {{item.performer.fullName}}
      </template>
      <template #[`item.recieveDate`]="{item}">
        {{persianFormat(item.recieveDate)}}
      </template>
      <template #[`item.cost`]="{item}">
        {{item.cost}}<span class="light"> تومان</span>
      </template>
      <template #[`item.count`]="{item}">
        {{item.count}}<span class="light"> روز</span>
      </template>
      <template #[`item.type`]="{item}">
        {{item.type==='prayer'?'نماز':'روزه'}}
      </template>
  </v-data-table>
</template>

<script>
export default {
    name:'ServicesTable',
    data(){
        return{
            headers:[
                { text: 'نام کامل بجا‌آورنده',sortable: false,value: 'performer'},
                { text: 'تاریخ دریافت',value: 'recieveDate' },
                { text: 'اجرت', value: 'cost' },
                { text: 'معرّف',sortable: false, value: 'introducerName' },
                { text: 'سفارش‌دهنده',sortable: false, value: 'customerName' },
                { text: 'بابت',sortable:false, value:'type'},
                { text: 'تعداد',value: 'count'}
            ]
        }
    },
    props:{
        items:Array
    }
}
</script>

<style>

</style>