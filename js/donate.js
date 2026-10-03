// Donate Page JavaScript: wizard navigation + personalized mailto links.
// All actions have plain href fallbacks so the page works without JS.

// Step navigation: instant swap, no slide animation.
function showStep(targetStepId) {
  const steps = document.querySelectorAll('.wizard-step');
  steps.forEach((step) => {
    step.classList.toggle('active', step.id === targetStepId);
  });
  const target = document.getElementById(targetStepId);
  if (target) {
    const heading = target.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectName = urlParams.get('source') || null;
  // session_id is an optional tracking token from inbound links; when present it is displayed and appended to generated support emails.
  const sessionId = urlParams.get('session_id') || null;

  // Hide empty project suffix so the title never shows a trailing blank.
  const projectNameSpan = document.getElementById('project-name');
  if (projectNameSpan) {
    projectNameSpan.textContent = projectName ? `for ${projectName}` : '';
  }

  // Update project name in international detail section
  const bankProjectNameInt = document.getElementById('bank-project-name-int');
  if (bankProjectNameInt) {
    bankProjectNameInt.textContent = projectName || 'my work';
  }

  // Update session IDs (hidden by default in CSS; shown only when provided)
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
      body += ` to avoid platform fees.\n\n[Your message here]\n\nBest regards,\n[Your Name]\n\n--- This is an auto-generated mail.`;
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

  // Enhance static mailto fallbacks with personalized links
  document.querySelectorAll('.bank-mail-trigger').forEach(anchor => {
    anchor.href = generateMailtoLink('bank');
  });

  // Large donation link
  const largeDonationLink = document.getElementById('large-donation-link');
  if (largeDonationLink) {
    largeDonationLink.href = generateMailtoLink('large');
  }

  // Bangladesh option: keep plain-href fallback, append tracking params when present
  const bangladeshButton = document.getElementById('bangladesh-option');
  if (bangladeshButton && (projectName || sessionId)) {
    const url = new URL(bangladeshButton.href);
    if (projectName) url.searchParams.set('source', projectName);
    if (sessionId) url.searchParams.set('session_id', sessionId);
    bangladeshButton.href = url.toString();
  }

  // Step navigation (anchors would also work via :target, but explicit is clearer)
  document.querySelectorAll('[data-target-step]').forEach(control => {
    control.addEventListener('click', (event) => {
      // Let real links behave as links; only buttons need manual stepping.
      if (control.tagName.toLowerCase() === 'a' && control.getAttribute('href')) return;
      event.preventDefault();
      showStep(control.dataset.targetStep);
    });
  });

  document.querySelectorAll('[data-back-target]').forEach(control => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      showStep(control.dataset.backTarget);
    });
  });
});
