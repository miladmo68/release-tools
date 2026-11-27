import mongoose from 'mongoose';
const garmentSchema=new mongoose.Schema({id:{type:String,required:true,unique:true},name:String,category:String,price:Number,color:String,image:String,material:String},{versionKey:false});
const Garment=mongoose.models.Garment||mongoose.model('Garment',garmentSchema);
export function mongoRepository(){return {list:async()=>Garment.find().lean(),find:async id=>Garment.findOne({id}).lean()};}
export function memoryRepository(seed){return {list:async()=>structuredClone(seed),find:async id=>structuredClone(seed.find(item=>item.id===id)??null)};}
