(function () {
  'use strict';

  // Bootstrap form validation
  const forms = document.querySelectorAll('.validation-check');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Password strength check with zxcvbn
  const passwordInput = document.getElementById('password');
  const strengthText = document.getElementById('strength-text');
  const strengthFill = document.getElementById('strength-fill');

  if (passwordInput && strengthText && strengthFill) {
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const result = zxcvbn(password);

      const score = result.score;
      const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
      const labels = ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong'];

      strengthFill.style.width = `${(score + 1) * 20}%`;
      strengthFill.style.backgroundColor = colors[score];
      strengthText.textContent = labels[score];
    });
  }
})();
