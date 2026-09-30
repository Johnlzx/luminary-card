import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,validateConfig,exportConfig} from '../src/config.js';
test('a full exported configuration round-trips without changing leading zeroes',()=>{
  const input={...DEFAULTS,title:'A < B',number:'0007',ticket:false,angle:359};
  assert.deepEqual(validateConfig(JSON.parse(exportConfig(input))),input);
});
test('partial imports fill defaults, clamp physical controls, and ignore unknown keys',()=>{
  const value=validateConfig({width:900,tilt:-8,primary:'#abcdEF',unknown:'ignored'});
  assert.equal(value.width,600);assert.equal(value.tilt,0);assert.equal(value.primary,'#ABCDEF');assert.equal(value.holder,'Alex Chen');assert.equal('unknown' in value,false);
});
test('malformed files and active URLs cannot enter the renderer',()=>{
  for(const input of [null,[],{}, {ticket:'false'}, {width:NaN}, {ratio:'other'}, {primary:'red;url(x)'}, {customTexture:'javascript:alert(1)'}, {version:9,config:DEFAULTS}]) assert.throws(()=>validateConfig(input));
});
test('custom images are embedded and missing custom textures fall back cleanly',()=>{
  assert.equal(validateConfig({...DEFAULTS,pattern:'custom'}).pattern,'rosette');
  const value={...DEFAULTS,pattern:'custom',customTexture:'data:image/png;base64,aGVsbG8='};
  assert.deepEqual(validateConfig(JSON.parse(exportConfig(value))),value);
});
