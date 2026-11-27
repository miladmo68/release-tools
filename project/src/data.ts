import seed from './seed.json';
import {composeLook,queryGarments} from '../server/domain.js';
export type Garment=typeof seed[number];
export type Slot='Layer'|'Top'|'Bottom';
export type Selection=Record<Slot,string>;
export const garments=seed as Garment[];
export {composeLook,queryGarments};
export const initialSelection:Selection={Layer:'layer-01',Top:'top-01',Bottom:'bottom-01'};
export function restoreSelection():Selection{try{const raw=JSON.parse(localStorage.getItem('merefold-look-v1')||'null');if(!raw)return initialSelection;return Object.fromEntries((['Layer','Top','Bottom'] as Slot[]).map(slot=>[slot,garments.some(item=>item.id===raw[slot]&&item.category===slot)?raw[slot]:initialSelection[slot]])) as Selection;}catch{return initialSelection;}}
export function persistSelection(selection:Selection){localStorage.setItem('merefold-look-v1',JSON.stringify(selection));}
