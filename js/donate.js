// Donate Page JavaScript - Clean & Simple

// Toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    const messageElement = toast.querySelector('span');
    messageElement.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

// Copy phone number
function copyPhoneNumber(phoneNumber) {
  navigator.clipboard.writeText(phoneNumber).then(() => {
    showToast('Phone number copied!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy.');
  });
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectName = urlParams.get('source') || null;
  const sessionId = urlParams.get('session_id') || null;

  // Update main title
  const mainTitleElement = document.getElementById('main-title');
  const projectNameSpan = document.getElementById('project-name');
  
  if (projectName) {
    projectNameSpan.textContent = `for ${projectName}`;
  } else {
    projectNameSpan.textContent = '';
  }

  // Update project names in detail sections
  const projectNameElements = [
    'bkash-project-name',
    'bank-project-name-bd',
    'bank-project-name-int'
  ];

  projectNameElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = projectName || 'my work';
    }
  });

  // Update session IDs
  const sessionIdElements = document.querySelectorAll('.session-id span');
  sessionIdElements.forEach(element => {
    if (sessionId) {
      element.textContent = `Session: ${sessionId}`;
      element.parentElement.style.display = 'block';
    } else {
      element.parentElement.style.display = 'none';
    }
  });

  // Generate mailto link
  function generateMailtoLink() {
    let subject = 'Donation';
    if (projectName) subject += ` for ${projectName}`;

    let body = `Dear Himel Das,\n\nI would like to know the details for a bank transfer to support`;
    if (projectName) body += ` ${projectName}.`;
    else body += `.`;
    body += `\n\nCould you please provide the necessary bank transfer information?\n\nThank you.\n\nBest regards,\n[Your Name]\n\n--- This is an auto-generated mail.`;
    if (sessionId) body += `\nSession ID: ${sessionId}`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    return `mailto:hello2himel@proton.me?subject=${encodedSubject}&body=${encodedBody}`;
  }

  // Bank mail triggers
  document.querySelectorAll('.bank-mail-trigger').forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = generateMailtoLink();
    });
  });

  // Step navigation
  const wizardSteps = document.querySelectorAll('.wizard-step');
  let currentActiveStep = document.querySelector('.wizard-step.active');
  const donationWizard = document.querySelector('.donation-wizard');

  // Set wizard height based on step
  function setWizardHeight(stepElement) {
    stepElement.style.position = 'static';
    stepElement.style.visibility = 'hidden';
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'translateX(0%)';
    stepElement.style.display = 'flex';

    void stepElement.offsetWidth;

    const targetHeight = stepElement.scrollHeight;
    donationWizard.style.minHeight = targetHeight + 'px';

    stepElement.style.position = 'absolute';
    stepElement.style.opacity = '0';
    stepElement.style.visibility = 'hidden';
  }

  // Initial setup
  if (donationWizard && currentActiveStep) {
    setWizardHeight(currentActiveStep);
    currentActiveStep.style.position = 'static';
    currentActiveStep.style.visibility = 'visible';
    currentActiveStep.style.opacity = '1';
    currentActiveStep.style.transform = 'translateX(0%)';
    currentActiveStep.style.display = 'flex';
  }

  // Show step function
  function showStep(targetStepId) {
    const targetStep = document.getElementById(targetStepId);
    if (!targetStep || targetStep === currentActiveStep) return;

    // Determine direction
    const currentStepIndex = Array.from(wizardSteps).indexOf(currentActiveStep);
    const targetStepIndex = Array.from(wizardSteps).indexOf(targetStep);
    const direction = (targetStepIndex < currentStepIndex) ? '-100%' : '100%';

    // Set height
    setWizardHeight(targetStep);

    // Animate out
    currentActiveStep.classList.remove('active');
    currentActiveStep.classList.add('exit');
    currentActiveStep.style.transform = `translateX(${-parseInt(direction)}%)`;

    // Animate in
    currentActiveStep.addEventListener('transitionend', function handler() {
      currentActiveStep.style.display = 'none';
      currentActiveStep.removeEventListener('transitionend', handler);

      targetStep.style.display = 'flex';
      void targetStep.offsetWidth;
      targetStep.classList.add('active');
      targetStep.classList.remove('exit');
      targetStep.style.transform = 'translateX(0%)';
      targetStep.style.opacity = '1';
      targetStep.style.visibility = 'visible';

      currentActiveStep = targetStep;
    }, { once: true });
  }

  // Navigation listeners
  document.querySelectorAll('[data-target-step]').forEach(button => {
    button.addEventListener('click', (event) => {
      const targetStepId = event.currentTarget.dataset.targetStep;
      showStep(targetStepId);
    });
  });

  document.querySelectorAll('[data-back-target]').forEach(button => {
    button.addEventListener('click', (event) => {
      const backTargetStepId = event.currentTarget.dataset.backTarget;
      showStep(backTargetStepId);
    });
  });
});