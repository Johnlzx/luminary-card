export const DEFAULTS = Object.freeze({
  ratio:'original', width:292, radius:28, ticket:true,
  preset:'pearl', primary:'#FFC9D8', secondary:'#F3E7BD', accent:'#C9B8EE', angle:200,
  pattern:'rosette', textureScale:38, textureOpacity:72, blend:'normal', emboss:true, customTexture:'',
  foil:100, glare:100, grain:100, tilt:10,
  title:'Luminary Club', subtitle:'Founding Member', holder:'Alex Chen', number:'0042', valid:'2028.09', textColor:'#1B3326', logo:'star', aurora:true
});
export const PRESETS = {
  pearl:{name:'Pearl', primary:'#FFC9D8', secondary:'#F3E7BD', accent:'#C9B8EE', angle:200},
  aurora:{name:'Aurora', primary:'#D9ACD5', secondary:'#A6F3D5', accent:'#94B9F3', angle:200},
  rose:{name:'Rose', primary:'#F8B9A6', secondary:'#F8D4AB', accent:'#D787B3', angle:200},
  abyss:{name:'Abyss', primary:'#12254F', secondary:'#173956', accent:'#402A78', angle:200},
  graphite:{name:'Graphite', primary:'#DBDBDB', secondary:'#A2A2A2', accent:'#616161', angle:200}
};
export const LIMITS = {width:[200,600],radius:[0,40],angle:[0,360],textureScale:[10,200],textureOpacity:[0,100],foil:[0,100],glare:[0,100],grain:[0,100],tilt:[0,18]};
const OPTIONS = {ratio:['original','credit','portrait','square','landscape'],preset:[...Object.keys(PRESETS),'custom'],pattern:['rosette','guilloche','rings','waves','grid','none','custom'],blend:['normal','overlay','soft-light','screen','multiply'],logo:['star','rings','none']};
export const RATIOS = {original:292/423, credit:85.6/53.98, portrait:2/3, square:1, landscape:4/3};
export function validateConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Choose a valid card configuration JSON file.');
  if (input.version !== undefined && input.version !== 1) throw new Error('This configuration version is not supported.');
  const data = input.config ?? input;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid card configuration.');
  if (!Object.keys(DEFAULTS).some(k => Object.hasOwn(data,k))) throw new Error('No card settings found in this file.');
  const result = {...DEFAULTS};
  for (const [key,value] of Object.entries(data)) {
    if (!Object.hasOwn(DEFAULTS,key)) continue;
    if (LIMITS[key]) {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Invalid ${key}.`);
      result[key] = Math.max(LIMITS[key][0],Math.min(LIMITS[key][1],Math.round(value)));
    } else if (OPTIONS[key]) {
      if (!OPTIONS[key].includes(value)) throw new Error(`Unknown ${key}.`);
      result[key] = value;
    } else if (typeof DEFAULTS[key] === 'boolean') {
      if (typeof value !== 'boolean') throw new Error(`Invalid ${key}.`);
      result[key] = value;
    } else if (['primary','secondary','accent','textColor'].includes(key)) {
      if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`Invalid ${key} color.`);
      result[key] = value.toUpperCase();
    } else if (key === 'customTexture') {
      if (typeof value !== 'string' || value.length > 4500000 || (value && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value))) throw new Error('Invalid texture image.');
      result[key] = value;
    } else {
      if (typeof value !== 'string') throw new Error(`Invalid ${key}.`);
      result[key] = value.slice(0, key === 'title' ? 48 : key === 'subtitle' ? 64 : 40);
    }
  }
  if (result.pattern === 'custom' && !result.customTexture) result.pattern = 'rosette';
  return result;
}
export function exportConfig(config) { return JSON.stringify({version:1,config:validateConfig(config)},null,2); }
