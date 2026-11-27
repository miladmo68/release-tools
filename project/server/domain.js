import {z} from 'zod';
export const category=z.enum(['Layer','Top','Bottom']);
export const garment=z.object({id:z.string().min(1),name:z.string().min(1),category,price:z.number().nonnegative(),color:z.string().min(1),image:z.string(),material:z.string().min(1)});
export function composeLook(items,selection){const chosen=['Layer','Top','Bottom'].map(slot=>items.find(item=>item.id===selection[slot]&&item.category===slot)).filter(Boolean);return {items:chosen,total:chosen.reduce((sum,item)=>sum+item.price,0),complete:chosen.length===3};}
export function queryGarments(items,{category:slot,q=''}={}){return items.filter(item=>(!slot||item.category===slot)&&`${item.name} ${item.material} ${item.color}`.toLowerCase().includes(q.toLowerCase()));}
