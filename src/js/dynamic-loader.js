import $ from 'jquery';

import { initRegistration } from './registration-module.js';
import { initWeather } from './weather-module.js';

export function initDynamicLoader() {
    $(document).ready(function () {
        function extractContent(html, selector) {
            const tempDiv = $('<div>').html(html);
            return tempDiv.find(selector).html();
        }

        $.get('registration.html')
            .done(function (data) {
                const formContent = extractContent(data, '.registration-form');
                if (formContent) {
                    $('#registration-content').html(`<form class="registration-form" id="registrationForm">${formContent}</form>`);
                    setTimeout(() => {
                        initRegistration();
                        console.log('Registration module initialized in container');
                    }, 100);
                } else {
                    $('#registration-content').html('<p>Error loading registration form</p>');
                }
            })
            .fail(function () {
                $('#registration-content').html('<p>Failed to load registration form</p>');
            });

        $.get('weather.html')
            .done(function (data) {
                const tempDiv = $('<div>').html(data);
                const weatherForm = tempDiv.find('.weather-form').prop('outerHTML');
                const weatherData = tempDiv.find('.weather-data').prop('outerHTML');
                const weatherError = tempDiv.find('.weather-error').prop('outerHTML');

                if (weatherForm) {
                    $('#weather-content').html(weatherForm + weatherData + weatherError);
                    setTimeout(() => {
                        initWeather();
                        console.log('Weather module initialized in container');
                    }, 100);
                } else {
                    $('#weather-content').html('<p>Error loading weather form</p>');
                }
            })
            .fail(function () {
                $('#weather-content').html('<p>Failed to load weather form</p>');
            });
    });
}
