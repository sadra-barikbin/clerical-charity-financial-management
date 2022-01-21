/*
 * Copyright 2018 Nazmul Idris All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/es5/util/colors';
import fa from 'vuetify/es5/locale/fa';
import en from 'vuetify/es5/locale/en';

// Theme builder - https://lobotuerto.com/thingies/vuetify-color-theme-builder/
Vue.use(Vuetify)
export default new Vuetify({
    theme: {
        primary: colors.deepPurple.base,
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3,
        // color for "surface", more info: http://tinyurl.com/y9l2oedo
        surface: colors.blueGrey.lighten1,
    },
    lang:{
        locales:{fa,en},
        current:'fa'
    },
    rtl:true,
    iconfont:'mdi'
});