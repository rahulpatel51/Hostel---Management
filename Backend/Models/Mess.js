import mongoose, { Document, Schema } from 'mongoose';
import { IMenu } from '../interfaces/IMenu';

export interface IMenuModel extends IMenu, Document {}

const MenuSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    day: { type: String, required: true },
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    snacks: { type: String },
    dinner: { type: String, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuModel>('Menu', MenuSchema);