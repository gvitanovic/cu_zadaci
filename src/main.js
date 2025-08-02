import $ from 'jquery';

import { initRegistration } from './js/registration-module.js';
import { initWeather } from './js/weather-module.js';
import { initDynamicLoader } from './js/dynamic-loader.js';

window.$ = window.jQuery = $;

$(document).ready(function () {
  if ($('#registration-content').length && $('#weather-content').length) {
    initDynamicLoader();
    console.log('Dynamic loader module initialized');
    return;
  }

  if ($('#registrationForm').length) {
    initRegistration();
    console.log('Registration module initialized');
  }

  if ($('#weatherForm').length) {
    initWeather();
    console.log('Weather module initialized');
  }
});