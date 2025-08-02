import $ from 'jquery';

window.$ = window.jQuery = $;

export function initRegistration() {
    $(document).ready(function () {
        $('.password-toggle').click(function () {
            const targetId = $(this).data('target');
            const targetInput = $('#' + targetId);
            const currentType = targetInput.attr('type');

            if (currentType === 'password') {
                targetInput.attr('type', 'text');
                $(this).text('🙈');
            } else {
                targetInput.attr('type', 'password');
                $(this).text('👁️');
            }
        });

        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function validatePassword(password) {
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /\d/.test(password);
            const passwordLength = password.length >= 6;
            return hasUppercase && hasLowercase && hasNumber && passwordLength;
        }

        function validateRepeatPassword(pass) {
            return pass === $('#password').val();
        }

        // for future purposes
        function validatePhone(phone) {
            return true;
        }

        function showError(fieldId, show = true, message = '') {
            console.log('showError called:', fieldId, show, message);
            const field = $('#' + fieldId);
            const formGroup = field.closest('.form-group');
            const errorMsg = $('#' + fieldId + 'Error');
            const requiredStar = formGroup.find('.required-star');

            console.log('Field found:', field.length, 'FormGroup found:', formGroup.length, 'ErrorMsg found:', errorMsg.length, 'RequiredStar found:', requiredStar.length);

            if (show) {
                field.addClass('error').removeClass('valid');
                formGroup.addClass('error').removeClass('valid');
                if (message) {
                    errorMsg.text(message);
                }
                errorMsg.addClass('show');
                // Make required star red for required fields
                requiredStar.css('color', '#e74c3c');
                console.log('Added error styles and red star');
            } else {
                field.removeClass('error').addClass('valid');
                formGroup.removeClass('error').addClass('valid');
                errorMsg.removeClass('show');
                requiredStar.css('color', '');
                console.log('Removed error styles and reset star');
            }
        }

        function clearValidation(fieldId) {
            const field = $('#' + fieldId);
            const formGroup = field.closest('.form-group');
            const errorMsg = $('#' + fieldId + 'Error');

            field.removeClass('error valid');
            formGroup.removeClass('error valid');
            errorMsg.removeClass('show');
        }

        $('#email').on('blur keyup', function () {
            const email = $(this).val().trim();
            if (email === '') {
                clearValidation('email');
            } else if (validateEmail(email)) {
                showError('email', false);
            } else {
                showError('email', true, 'Please enter a valid email address');
            }
        });

        $('#password').on('blur keyup', function () {
            const password = $(this).val();
            if (password === '') {
                clearValidation('password');
            } else if (validatePassword(password)) {
                showError('password', false);
            } else {
                showError('password', true, 'Password must contain at least one uppercase letter, lowercase letter, and number (min 6 characters)');
            }

            // Re-validate confirm password if it has a value
            const confirmPassword = $('#confirmPassword').val();
            if (confirmPassword !== '') {
                $('#confirmPassword').trigger('keyup');
            }
        });

        $('#confirmPassword').on('blur keyup', function () {
            const confirmPassword = $(this).val();

            if (confirmPassword === '') {
                clearValidation('confirmPassword');
            } else if (validateRepeatPassword(confirmPassword)) {
                showError('confirmPassword', false);
            } else {
                showError('confirmPassword', true, 'Passwords do not match');
            }
        });

        $('#phone').on('blur keyup', function () {
            const phone = $(this).val().trim();
            if (phone === '') {
                clearValidation('phone');
            } else if (validatePhone(phone)) {
                showError('phone', false);
            } else {
                showError('phone', true, 'Please enter a valid phone number');
            }
        });

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

        function validateAllFields() {
            console.log('validateAllFields started');
            const fields = [
                { id: 'email', value: $('#email').val().trim(), required: true, validator: validateEmail },
                { id: 'password', value: $('#password').val(), required: true, validator: validatePassword },
                { id: 'confirmPassword', value: $('#confirmPassword').val(), required: true, validator: validateRepeatPassword },
                { id: 'phone', value: $('#phone').val().trim(), required: false, validator: validatePhone }
            ];

            let isValid = true;

            fields.forEach(field => {
                const { id, value, required, validator } = field;
                console.log(`Validating field ${id}:`, { value, required });

                if (required && value === '') {
                    console.log(`Field ${id} is required but empty`);
                    const errorMessages = {
                        'email': 'Email address is required',
                        'password': 'Password is required',
                        'confirmPassword': 'Please confirm your password',
                        'phone': 'Phone number is required'
                    };
                    showError(id, true, errorMessages[id]);
                    isValid = false;
                } else if (value !== '' && !validator(value)) {
                    const errorMessages = {
                        'email': 'Please enter a valid email address',
                        'password': 'Password must contain at least one uppercase letter, lowercase letter, and number (min 6 characters)',
                        'confirmPassword': 'Passwords do not match',
                        'phone': 'Please enter a valid phone number'
                    };
                    showError(id, true, errorMessages[id]);
                    isValid = false;
                } else if (value !== '' && validator(value)) {
                    showError(id, false);
                } else if (!required && value === '') {
                    clearValidation(id);
                }
            });

            console.log('validateAllFields returning:', isValid);
            return isValid;
        }

        $(document).on('submit', '#registrationForm', function (e) {
            e.preventDefault();

            $('.form-group').removeClass('error valid');
            $('.form-group input').removeClass('error valid');
            $('.error-message').removeClass('show');
            $('.required-star').css('color', '');

            const isValid = validateAllFields();

            if (isValid) {
                $('#registerBtn').prop('disabled', true).text('Registering...');

                setTimeout(() => {
                    const success = Math.random() > 0.3; // 70% success rate for demo

                    if (success) {
                        showNotification('Registration successful! Welcome aboard! 🎉', 'success');
                        $('#registrationForm')[0].reset();
                        $('.form-group input').removeClass('error valid');
                        $('.form-group').removeClass('error valid');
                        $('.error-message').removeClass('show');
                    } else {
                        showNotification('Registration failed. Please try again later. ❌', 'error');
                    }

                    $('#registerBtn').prop('disabled', false).text('Register');
                }, 1500);
            } else {
                showNotification('Please fill in all required fields and fix any errors. ⚠️', 'error');
            }
        });

        $(document).on('click', '#registerBtn', function (e) {
            console.log('Register button clicked');
            const form = $('#registrationForm');
            if (form.length) {
                console.log('Triggering form submit programmatically');
                form.trigger('submit');
            }
        });
    });
}
