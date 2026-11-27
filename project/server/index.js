import mongoose from 'mongoose';
import seed from '../src/seed.json' with {type:'json'};
import {createApp} from './app.js';
import {mongoRepository,memoryRepository} from './repositories.js';
const uri=process.env.MONGODB_URI;
if(uri)await mongoose.connect(uri);
const repository=uri?mongoRepository():memoryRepository(seed);
const port=Number(process.env.PORT||3001);
createApp(repository).listen(port,()=>console.log(`Merefold API listening on ${port}`));
