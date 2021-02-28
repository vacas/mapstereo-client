import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// id: number;
// left: number;
// top: number;
// title: string;
// blobUrl?: string;
// type: string;
// isListItem?: boolean;
// cards?: Array<number>;

const box = new Schema({
  title: {
    type: String,
    default: '',
  },
  id: {
    type: Number,
    required: true,
  },
  left: {
    type: Number,
    required: true,
  },
  top: {
    type: Number,
    required: true,
  },
  blobUrl: {
    type: String,
  },
  type: {
    type: String,
    default: 'box',
  },
  isListItem: {
    type: Boolean,
    default: false,
  },
  cards: {
    type: Array,
  }
});

const Box = mongoose.model('Box', box);

export default Box;