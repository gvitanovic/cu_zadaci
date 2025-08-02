import $ from 'jquery';

window.$ = window.jQuery = $;

export function initWeather() {
    $(document).ready(function () {
        function showNotification(message, type = 'success') {
            $('.notification').remove();

            const notification = $(`
                <div class="notification ${type}">
                    ${message}
                </div>
            `);

            $('body').append(notification);

            setTimeout(() => {
                notification.addClass('show');
            }, 100);

            setTimeout(() => {
                notification.removeClass('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }

        $('#weatherForm').submit(function (e) {
            e.preventDefault();

            const city = $('#city').val().trim();
            if (!city) {
                showNotification('Please enter a city name. 🏙️', 'error');
                return;
            }

            $('#weatherData').hide();
            $('#weatherError').hide();

            $('#weatherBtn').prop('disabled', true);
            $('.btn-text').hide();
            $('.btn-loader').show();

            const apiKey = '28d3ef3f4673fe96a197d709fa71a90b';
            const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&APPID=${apiKey}&units=metric`;

            $.ajax({
                url: apiUrl,
                method: 'GET',
                success: function (data) {
                    if (data.cod && data.cod !== 200) {
                        showWeatherError(data.message || 'City not found. Please check the spelling and try again.');
                        return;
                    }
                    displayWeatherData(data);
                },
                error: function (xhr) {
                    let errorMessage = 'An error occurred while fetching weather data.';

                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        if (errorData.cod === "404" || errorData.cod === 404) {
                            errorMessage = errorData.message || 'City not found. Please check the spelling and try again.';
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        }
                    } catch (e) {
                        if (xhr.status === 400 || xhr.status === 404) {
                            errorMessage = 'City not found. Please check the spelling and try again.';
                        } else if (xhr.status === 401) {
                            errorMessage = 'Invalid API key. Please check your configuration.';
                        } else if (xhr.status === 403) {
                            errorMessage = 'API limit exceeded. Please try again later.';
                        }
                    }

                    showWeatherError(errorMessage);
                },
                complete: function () {
                    $('#weatherBtn').prop('disabled', false);
                    $('.btn-text').show();
                    $('.btn-loader').hide();
                }
            });
        });

        function displayWeatherData(data) {
            $('.data-grid').empty();

            const tempElement = $(`
                <div class="data-item">
                    <div class="data-label">Temperature</div>
                    <p class="data-value">${data.main.temp}°C</p>
                </div>
            `);

            const latElement = $(`
                <div class="data-item">
                    <div class="data-label">Latitude</div>
                    <p class="data-value">${data.coord.lat}</p>
                </div>
            `);

            const lonElement = $(`
                <div class="data-item">
                    <div class="data-label">Longitude</div>
                    <p class="data-value">${data.coord.lon}</p>
                </div>
            `);

            $('.data-grid').append(tempElement, latElement, lonElement);

            $('#weatherData').slideDown(300);
            $('#weatherError').hide();

            showNotification(`Weather data for ${data.name} loaded successfully! 🌟`, 'success');
        }

        function showWeatherError(message) {
            $('#errorMessage').text(message);
            $('#weatherError').slideDown(300);
            $('#weatherData').hide();
            showNotification('Failed to fetch weather data. ❌', 'error');
        }
    });
}
