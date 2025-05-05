import { model, Schema } from 'mongoose';

const blockSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Block name is required'],
      unique: true,
      trim: true,
      enum: {
        values: ['Block A', 'Block B', 'Block C', 'Block D'],
        message: 'Block name must be one of: Block A, Block B, Block C, Block D',
      },
    },
    description: {
      type: String,
      required: [true, 'Block description is required'],
      minlength: [20, 'Description must be at least 20 characters long'],
    },
    totalRooms: {
      type: Number,
      required: true,
      min: [0, 'Total rooms cannot be negative'],
    },
    occupiedRooms: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator(value) {
          return value <= this.totalRooms;
        },
        message: 'Occupied rooms cannot exceed total rooms',
      },
    },
    vacantRooms: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maintenanceRooms: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator(value) {
          return value <= this.totalRooms;
        },
        message: 'Maintenance rooms cannot exceed total rooms',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      match: [/^https?:\/\/.+/, 'Please use a valid HTTP/HTTPS URL'],
    },
    genderType: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Mixed'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual - Occupancy Percentage
blockSchema.virtual('occupancyPercentage').get(function () {
  if (!this.totalRooms) return 0;
  return Math.round((this.occupiedRooms / this.totalRooms) * 100);
});

// Pre-save hook to auto-calculate vacant rooms and update timestamp
blockSchema.pre('save', function (next) {
  this.vacantRooms = this.totalRooms - this.occupiedRooms - this.maintenanceRooms;
  this.updatedAt = new Date();
  next();
});

// Static method to recalculate room stats from Room model
blockSchema.statics.updateBlockStats = async function (blockId) {
  const Room = this.model('Room');
  const block = await this.findById(blockId);
  if (!block) return;

  const rooms = await Room.find({ block: block.name.split(' ')[1] });

  block.occupiedRooms = rooms.filter(r => r.status === 'Full').length;
  block.maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  block.vacantRooms = block.totalRooms - block.occupiedRooms - block.maintenanceRooms;

  await block.save();
};

// Indexes
blockSchema.index({ name: 1 }, { unique: true });
blockSchema.index({ genderType: 1 });
blockSchema.index({ totalRooms: 1 });
blockSchema.index({ occupiedRooms: 1 });

const Block = model('Block', blockSchema);
export default Block;
