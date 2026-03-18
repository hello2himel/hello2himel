// Donate Page JavaScript - Clean & Simple
const TOAST_MS_PER_CHAR = 120;
const getToastDuration = (message) => Math.max(3000, message.length * TOAST_MS_PER_CHAR);

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

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectName = urlParams.get('source') || null;
  // session_id is an optional tracking token from inbound links; when present it is displayed and appended to generated support emails.
  const sessionId = urlParams.get('session_id') || null;

  // Update main title
  const projectNameSpan = document.getElementById('project-name');
  if (projectName) {
    projectNameSpan.textContent = `for ${projectName}`;
  } else {
    projectNameSpan.textContent = '';
  }

  // Update project name in international detail section
  const bankProjectNameInt = document.getElementById('bank-project-name-int');
  if (bankProjectNameInt) {
    bankProjectNameInt.textContent = projectName || 'my work';
  }

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
  function generateMailtoLink(type = 'bank') {
    let subject = type === 'large' ? 'Large Donation Inquiry' : 'Donation';
    if (projectName) subject += ` for ${projectName}`;

    let body;

    if (type === 'large') {
      body = `Dear Himel Das,\n\nI'd like to discuss a larger donation directly`;
      if (projectName) body += ` to support ${projectName}`;
      body += ` so that we can avoid third-party fees.\n\n[Your message here]\n\nBest regards,\n[Your Name]\n\n--- This is an auto-generated mail.`;
    } else {
      body = `Dear Himel Das,\n\nI would like to know the details for a bank transfer to support`;
      if (projectName) body += ` ${projectName}.`;
      else body += `.`;
      body += `\n\nCould you please provide the necessary bank transfer information?\n\nThank you.\n\nBest regards,\n[Your Name]\n\n--- This is an auto-generated mail.`;
    }

    if (sessionId) body += `\nSession ID: ${sessionId}`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    return `mailto:hello2himel@proton.me?subject=${encodedSubject}&body=${encodedBody}`;
  }

  // Bank mail triggers
  document.querySelectorAll('.bank-mail-trigger').forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = generateMailtoLink('bank');
    });
  });

  // Large donation link
  const largeDonationLink = document.getElementById('large-donation-link');
  if (largeDonationLink) {
    largeDonationLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = generateMailtoLink('large');
    });
  }

  // Bangladesh button — redirect to SupportKori
  const bangladeshButton = document.querySelector('[data-target-step="step-bangladesh-redirect"]');
  if (bangladeshButton) {
    bangladeshButton.addEventListener('click', () => {
      window.open('https://supportkori.com/hello2himel', '_blank', 'noopener,noreferrer');
    });
  }

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
