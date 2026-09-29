document.addEventListener('DOMContentLoaded', () => {
  const welcome = document.getElementById('welcome');
  const assessment = document.getElementById('assessment');
  const aftercare = document.getElementById('aftercare');
  const back = document.getElementById('back-to-menu');
  const action = document.getElementById('appointment-action');
  const title = document.getElementById('aftercare-title');
  const routes = {
    '#reagendar': ['reschedule', 'Quero reagendar meu horário'],
    '#cancelar': ['cancel', 'Quero cancelar meu horário'],
    '#horario': ['late', 'Estou atrasada ou preciso falar sobre meu horário']
  };

  function navigate(focusHeading) {
    const hash = window.location.hash;
    const route = routes[hash];
    const isAssessment = hash === '#avaliacao';
    welcome.hidden = isAssessment || Boolean(route);
    assessment.hidden = !isAssessment;
    aftercare.hidden = !route;
    back.hidden = !welcome.hidden;
    if (route) {
      action.value = route[0];
      title.textContent = route[1];
      action.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (focusHeading) {
      const heading = route ? title : document.getElementById(isAssessment ? 'assessment-title' : 'welcome-title');
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  window.addEventListener('hashchange', () => navigate(true));
  navigate(false);
});
