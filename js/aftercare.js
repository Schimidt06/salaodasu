document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('aftercare-form');
  const action = document.getElementById('appointment-action');
  const name = document.getElementById('appointment-name');
  const date = document.getElementById('appointment-date');
  const time = document.getElementById('appointment-time');
  const note = document.getElementById('appointment-note');
  const error = document.getElementById('appointment-error');
  const preview = document.getElementById('appointment-preview');
  const options = {
    reschedule: ['REAGENDAMENTO', 'Não conseguirei comparecer no horário marcado e gostaria de verificar outras disponibilidades.'],
    cancel: ['CANCELAMENTO', 'Solicito o cancelamento do meu horário. Aguardo sua confirmação.'],
    late: ['SOBRE MEU HORÁRIO', 'Preciso falar sobre meu horário marcado.']
  };
  let attempted = false;

  function message() {
    if (!options[action.value]) return 'Escolha uma opção e preencha os dados do seu horário.';
    const [title, closing] = options[action.value];
    const formattedDate = date.value ? date.value.split('-').reverse().join('/') : '(informe a data)';
    const lines = [
      `PÓS-AGENDAMENTO SOLARI — ${title}`, '',
      `Olá, Suellen! Meu nome é ${name.value.trim() || '(informe seu nome)'}.`,
      `Data marcada: ${formattedDate}`,
      `Horário marcado: ${time.value || '(informe o horário)'}`
    ];
    if (note.value.trim()) lines.push(`${action.value === 'late' ? 'Observação' : 'Motivo'}: ${note.value.trim()}`);
    lines.push('', closing);
    return lines.join('\n');
  }

  function validate() {
    const validName = name.value.trim().length <= 80 &&
      (name.value.match(/\p{L}/gu) || []).length >= 2 && /^[\p{L}\p{M} .’'&-]+$/u.test(name.value.trim());
    const checks = [
      [action, Boolean(options[action.value]), 'Escolha como podemos ajudar.'],
      [name, validName, 'Informe seu nome com pelo menos 2 letras, sem números ou emojis.'],
      [date, Boolean(date.value) && date.checkValidity(), 'Informe uma data válida para o horário marcado.'],
      [time, Boolean(time.value) && time.checkValidity(), 'Informe o horário marcado.'],
      [note, note.value.length <= 300 && (action.value !== 'late' || Boolean(note.value.trim())), 'Escreva uma observação de até 300 caracteres sobre seu horário.']
    ];
    let first = null;
    checks.forEach(([field, valid, text]) => {
      field.classList.toggle('input-error', !valid);
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid && !first) first = { field, text };
    });
    error.textContent = first ? first.text : '';
    error.classList.toggle('visible', Boolean(first));
    return first;
  }

  function update() {
    const isLate = action.value === 'late';
    note.required = isLate;
    document.getElementById('appointment-note-label').textContent = isLate ? 'Observação *' : 'Motivo (opcional)';
    note.placeholder = isLate ? 'Ex.: Vou me atrasar aproximadamente 15 minutos.' : 'Se desejar, conte o motivo.';
    preview.textContent = message();
    if (attempted) validate();
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    attempted = true;
    const invalid = validate();
    if (invalid) {
      invalid.field.focus();
      return;
    }
    window.location.assign(`https://wa.me/5514998063662?text=${encodeURIComponent(message())}`);
  });
  update();
});
