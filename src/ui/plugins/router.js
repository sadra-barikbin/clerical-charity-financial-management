import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import PersonReport from '@/ui/components/PersonReport';
import NewPerson from '@/ui/components/NewPerson';
import Banner from '@/ui/components/Banner';
import NewLoan from '@/ui/components/NewLoan';
import Settings from '@/ui/components/Settings';
import NewService from '@/ui/components/NewService';
import NewHelp from '@/ui/components/NewHelp';
import LoanState from '@/ui/components/LoanState';
import GeneralReport from '@/ui/components/GeneralReport';
export default new VueRouter({routes:
    [
        {path:'/newperson',component:NewPerson},
        {path:'/personreport',component:PersonReport},
        {path:'/newloan',component:NewLoan},
        {path:'/settings',component:Settings},
        {path:'/loanstate',component:LoanState},
        {path:'/generalreport',component:GeneralReport},
        {path:'/newservice',component:NewService},
        {path:'/newhelp',component:NewHelp},
        {path:'/',component:Banner}
    ],
});
