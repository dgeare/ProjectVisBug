import test from 'ava';

import { makeKeyUtils } from "./../app/utilities/key-utils.js";

test('arrows is as expected', t => {
  let keys = makeKeyUtils();
  t.true(Array.isArray(keys.arrows), "keys.arrows is an array");
  t.true(keys.arrows.includes("up"), "Arrows contains up");
})

test('keyEvents concatenates an array with shift', t => {
  const keys = makeKeyUtils();
  const events = keys.keyEvents(["up","down"], "shift");
  t.true(events.join(',') === "up,down,up+shift,down+shift");
})

test('keyEvents concatenates an array with [shift,alt]', t => {
  const keys = makeKeyUtils();
  const events = keys.keyEvents(["up"], ["shift","alt"]);
  t.true(events.join(',') === "up,up+shift,up+alt,up+shift+alt");
})
