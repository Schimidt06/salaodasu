const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function loadApp() {
  const elements = new Map();
  const destinations = [];
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      const listeners = {};
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
        focus() {}, scrollIntoView() {}, querySelectorAll: () => []
      });
    }
    return elements.get(id);
  }
  vm.runInNewContext(readFileSync(require.resolve('../js/app.js'), 'utf8'), {
    document: { getElementById: element, addEventListener: (_, init) => init() },
    window: {
      location: { assign: url => destinations.push(new URL(url)) },
      open() { throw new Error('Envio não deve depender de pop-up'); }
    },
    setTimeout: () => 1, clearTimeout() {}
  });
  return { element, destinations };
}

for (const button of ['btn-send-whatsapp', 'btn-floating-send']) {
  test(`${button}: exige nome e seleção`, () => {
    const { element, destinations } = loadApp();
    element(button).emit('click');
    assert.ok(element('name-error').classList.contains('visible'));
    assert.equal(destinations.length, 0);
    element('input-name').value = 'Ana';
    element(button).emit('click');
    assert.match(element('toast-element').textContent, /Selecione ao menos/);
    assert.equal(destinations.length, 0);
  });

  test(`${button}: envia dados preenchidos sem eventos e preserva caracteres`, () => {
    const { element, destinations } = loadApp();
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
