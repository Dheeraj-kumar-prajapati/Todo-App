document.addEventListener('DOMContentLoaded', () => {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpForm = document.getElementById('otp-form');
    const errorMessage = document.getElementById('error-message');
    const resendButton = document.getElementById('re-send');
    const timerDisplay = document.getElementById('timer');

    let timeLeft = 30;
    let timerId;

    function startTimer() {
        resendButton.disabled = true;
        timerId = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerId);
                resendButton.disabled = false;
                timerDisplay.textContent = "You can now resend OTP";
            } else {
                timerDisplay.textContent = `Resend OTP in ${timeLeft} seconds`;
                timeLeft--;
            }
        }, 1000);
    }

    startTimer();

    resendButton.addEventListener('click', () => {
        console.log('Resending OTP...');
        timeLeft = 30;
        errorMessage.innerHTML = '';
        otpInputs.forEach(e => {
            e.value = '';
        })
        startTimer();

        fetch('/resend-otp', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.message) {
                    // alert(data.message);
                } else if (data.error) {
                    throw new Error(data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = 'Failed to resend OTP. Please try again.';
            });
    });

    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            if (value.length === 0 && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        if (otp.length === otpInputs.length) {
            console.log('OTP entered:', otp);
            fetch('/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('OTP verification failed');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    if (data.message) {
                        console.log('i am in alert');
                        alert(data.message);
                        window.location.href = '/login';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    errorMessage.textContent = 'OTP verification failed. Please try again.';
                });
        } else {
            errorMessage.textContent = 'Please enter all OTP digits.';
        }
    });
});