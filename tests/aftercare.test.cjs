const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');

function app() {
  const fields = new Map();
  const urls = [];
  const get = id => {
    if (!fields.has(id)) {
      const listeners = {};
      fields.set(id, {
        value: '', classList: { toggle() {} }, setAttribute() {}, focus() {},
        checkValidity() { return this.valid !== false; },
        addEventListener: (event, fn) => { listeners[event] = fn; },
        emit: event => listeners[event]({ preventDefault() {} })
      });
    }
    return fields.get(id);
  };
  vm.runInNewContext(readFileSync(require.resolve('../js/aftercare.js'), 'utf8'), {
    document: { getElementById: get, addEventListener: (_, fn) => fn() },
    window: { location: { assign: url => urls.push(new URL(url)) } }
  });
  get('appointment-name').value = 'João Pedro';
  get('appointment-date').value = '2026-10-03';
  get('appointment-time').value = '14:30';
  return { get, urls, submit: () => get('aftercare-form').emit('submit') };
}

for (const [action, closing] of [
  ['reschedule', 'Não conseguirei comparecer no horário marcado e gostaria de verificar outras disponibilidades.'],
  ['cancel', 'Solicito o cancelamento do meu horário. Aguardo sua confirmação.'],
  ['late', 'Preciso falar sobre meu horário marcado.']
]) {
  test(`${action}: mensagem independente da pré-avaliação`, () => {
    const { get, urls, submit } = app();
    get('appointment-action').value = action;
    if (action === 'late') get('appointment-note').value = 'Vou me atrasar aproximadamente 15 minutos.';
    get('aftercare-form').emit('change');
    submit();
    assert.equal(urls.length, 1);
    assert.equal(urls[0].pathname, '/5514998063662');
    const text = urls[0].searchParams.get('text');
    assert.ok(text.includes('PÓS-AGENDAMENTO SOLARI'));
    assert.ok(text.includes('João Pedro'));
    assert.ok(text.includes('03/10/2026'));
    assert.ok(text.includes('14:30'));
    assert.ok(text.endsWith(closing));
    assert.equal(text, get('appointment-preview').textContent);
    if (action === 'late') assert.ok(text.includes('15 minutos'));
    else assert.ok(!text.includes('Motivo:'));
  });
}

for (const field of ['action', 'name', 'date', 'time']) {
  test(`bloqueia ausência de ${field}`, () => {
    const { get, urls, submit } = app();
    get('appointment-action').value = 'cancel';
    get(`appointment-${field}`).value = '';
    submit();
    assert.equal(urls.length, 0);
    assert.ok(get('appointment-error').textContent);
  });
}

test('atraso exige observação; troca para cancelamento permite motivo vazio', () => {
  const { get, urls, submit } = app();
  get('appointment-action').value = 'late';
  get('aftercare-form').emit('change');
  assert.equal(get('appointment-note').required, true);
  submit();
  assert.equal(urls.length, 0);
  get('appointment-action').value = 'cancel';
  get('aftercare-form').emit('change');
  assert.equal(get('appointment-note').required, false);
  submit();
  assert.equal(urls.length, 1);
});

test('rejeita nome inválido, data inválida e observação longa', () => {
  for (const [field, value] of [['name', '123'], ['note', 'a'.repeat(301)], ['date', '2026-02-30']]) {
    const { get, urls, submit } = app();
    get('appointment-action').value = 'reschedule';
    get(`appointment-${field}`).value = value;
    if (field === 'date') get('appointment-date').valid = false;
    submit();
    assert.equal(urls.length, 0);
  }
});

test('preserva motivo opcional e caracteres especiais sem alterar a URL', () => {
  const { get, urls, submit } = app();
  get('appointment-action').value = 'reschedule';
  get('appointment-note').value = 'Reunião & viagem + imprevisto?';
  submit();
  assert.ok(urls[0].searchParams.get('text').includes('Motivo: Reunião & viagem + imprevisto?'));
  assert.equal(urls[0].searchParams.size, 1);
});
