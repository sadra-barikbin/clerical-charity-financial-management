<!--
  - Copyright 2018 Nazmul Idris All rights reserved.
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
    <v-app>
        <v-navigation-drawer app right class="d-print-none">
            <v-list-item to="/">
                <v-list-item-content>
                    <v-list-item-title class="title">
                        مدیریت مراجعات مالی
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        موسسه آیت الله باریک بین
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list dense nav>
                <v-list-item-group v-model="currentPage" no-action >
                    <v-list-item :to="page.route" replace v-for="page in pages" :key="page.number" link>
                        <v-list-item-avatar>
                            <v-icon>{{ page.icon }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title>{{ page.title }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>
        <v-main id="appContainer">
            <v-container fluid>
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </v-container>
        </v-main>
        <!-- <v-footer app>
        </v-footer> -->
    </v-app>
</template>

<script>
    export default {
        name: 'App',
        data: () => {
            return {
                pages:[
                    {title:'فرد جدید',icon:'mdi-account-plus',route:'/newperson',number:1},
                    {title:'وام جدید',icon:'mdi-cash-plus',route:'/newloan',number:2},
                    {title:'روزه و نماز جدید',icon:'mdi-newspaper-plus',route:'/newservice',number:3},
                    {title:'کمک جدید',icon:'mdi-hand-heart',route:'/newhelp',number:4},
                    {title:'کارنامه فرد',icon:'mdi-file-chart',route:'/personreport',number:5},
                    {title:'وضعیت وام',icon:'mdi-cash-register',route:'/loanstate',number:6},
                    {title:'گزارش کلی',icon:'mdi-view-list',route:'/generalreport',number:7},
                    {title:'تنظیمات',icon:'mdi-cog',route:'/settings',number:8}
                ],
                currentPage:1
            }
        },
    };
</script>
<style lang="scss" scoped>
@import 'assets/style.css';
#app{
    font-family: 'Shabnam';
}
.title{
    font-family: 'Shabnam'!important;
}
@media print {
    #appContainer{
        padding-right:0 !important ;
    }
}
</style>