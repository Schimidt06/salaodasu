const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function loadApp(serviceCategory = 'Cortes') {
  const elements = new Map();
  const destinations = [];
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      const listeners = {};
      const attributes = {};
      elements.set(id, {
        value: '', style: {}, textContent: '', innerHTML: '',
        tagName: id.startsWith('select-') ? 'SELECT' : 'INPUT',
        classList: {
          add: c => classes.add(c), remove: c => classes.delete(c),
          contains: c => classes.has(c),
          toggle: (c, enabled) => enabled ? classes.add(c) : classes.delete(c)
        },
        addEventListener: (event, handler) => { listeners[event] = handler; },
        emit(event) { listeners[event]?.({ target: this }); },
        setAttribute: (name, value) => { attributes[name] = value; },
        getAttribute: name => attributes[name],
        focus() {}, scrollIntoView() {},
        querySelector: () => element('indicator'),
        querySelectorAll: () => id === 'services-catalog-root' ? [element('service-card')] : []
      });
    }
    return elements.get(id);
  }
  element('service-card').setAttribute('data-id', 'service-test');
  element('service-card').setAttribute('data-name', 'Serviço de teste');
  element('service-card').setAttribute('data-category', serviceCategory);
  vm.runInNewContext(readFileSync(require.resolve('../js/app.js'), 'utf8'), {
    SERVICES_DATA: [],
    document: { getElementById: element, addEventListener: (_, init) => init() },
    window: {
      location: { assign: url => destinations.push(new URL(url)) },
      open() { throw new Error('Envio não deve depender de pop-up'); }
    },
    setTimeout: () => 1, clearTimeout() {}
  });
  return { element, destinations };
}

function fillRequired(element) {
  element('input-name').value = 'João Pedro';
  element('select-length').value = 'Médio (na altura do ombro)';
  element('select-color-current').value = 'Castanho / Preto';
  element('select-history').value = 'Cabelo virgem (sem química)';
}

for (const button of ['btn-send-whatsapp', 'btn-floating-send']) {
  test(`${button}: exige nome e seleção`, () => {
    const { element, destinations } = loadApp();
    element(button).emit('click');
    assert.ok(element('name-error').classList.contains('visible'));
    assert.equal(destinations.length, 0);
    fillRequired(element);
    element(button).emit('click');
    assert.ok(element('selection-error').classList.contains('visible'));
    assert.equal(destinations.length, 0);
  });

  test(`${button}: envia dados preenchidos sem eventos e preserva caracteres`, () => {
    const { element, destinations } = loadApp();
    fillRequired(element);
    element('orientation-toggle').emit('click');
    element('input-name').value = '  Ana & João  ';
    element('select-length').value = 'Longo (abaixo do ombro)';
    element('textarea-notes').value = 'Cotação: mechas + corte? 💛';
    element(button).emit('click');
    assert.equal(destinations.length, 1);
    assert.equal(destinations[0].origin, 'https://wa.me');
    assert.equal(destinations[0].pathname, '/5514998063662');
    const message = destinations[0].searchParams.get('text');
    assert.ok(message.includes('*Ana & João*'));
    assert.ok(message.includes('avaliação personalizada'));
    assert.ok(message.includes('Longo (abaixo do ombro)'));
    assert.ok(message.includes('Cotação: mechas + corte? 💛'));
  });
}

test('mudanças de select atualizam a prévia mesmo sem evento input', () => {
  const { element } = loadApp();
  element('select-color-current').value = 'Ruivo / Acobreado';
  element('select-color-current').emit('change');
  assert.ok(element('whatsapp-preview-text').textContent.includes('Ruivo / Acobreado'));
});

for (const button of ['btn-send-whatsapp', 'btn-floating-send', 'btn-copy-text']) {
  for (const field of ['input-name', 'select-length', 'select-color-current', 'select-history']) {
    test(`${button}: bloqueia ausência de ${field}`, () => {
      const { element, destinations } = loadApp();
      fillRequired(element);
      element('service-card').emit('click');
      element(field).value = '';
      element(button).emit('click');
      assert.equal(destinations.length, 0);
      assert.equal(element(field).getAttribute('aria-invalid'), 'true');
    });
  }
}

for (const name of [' ', 'A', '123456', 'Ana123', 'João 💛']) {
  test(`rejeita nome inválido: ${JSON.stringify(name)}`, () => {
    const { element, destinations } = loadApp();
    fillRequired(element);
    element('service-card').emit('click');
    element('input-name').value = name;
    element('btn-send-whatsapp').emit('click');
    assert.equal(destinations.length, 0);
    assert.equal(element('input-name').getAttribute('aria-invalid'), 'true');
  });
}

for (const history of ['Cabelo virgem (sem química)', 'Já tenho coloração / tintura', 'Mais de um procedimento químico', 'Não tenho certeza']) {
  test(`preserva histórico e texto sem emojis: ${history}`, () => {
    const { element, destinations } = loadApp();
    fillRequired(element);
    element('select-history').value = history;
    element('service-card').emit('click');
    element('btn-send-whatsapp').emit('click');
    const message = destinations[0].searchParams.get('text');
    assert.ok(message.includes(history));
    assert.ok(message.includes('João Pedro'));
    assert.ok(message.includes('avaliação, valores e horários'));
    assert.doesNotMatch(message, /[\uFFFD\p{Extended_Pictographic}]/u);
    assert.equal(message, element('whatsapp-preview-text').textContent);
  });
}

for (const category of ['Mechas & Iluminação', 'Coloração & Tonalização']) {
  test(`exige objetivo de cor para ${category} e remove exigência ao desmarcar`, () => {
    const { element, destinations } = loadApp(category);
    fillRequired(element);
    element('service-card').emit('click');
    assert.equal(element('select-color-goal').required, true);
    element('btn-send-whatsapp').emit('click');
    assert.equal(destinations.length, 0);
    assert.ok(element('color-goal-error').classList.contains('visible'));
    element('select-color-goal').value = 'Quero orientação sobre a cor';
    element('select-color-goal').emit('change');
    assert.equal(element('color-goal-error').classList.contains('visible'), false);
    element('btn-send-whatsapp').emit('click');
    assert.equal(destinations.length, 1);
    element('service-card').emit('click');
    assert.equal(element('select-color-goal').required, false);
  });
}
