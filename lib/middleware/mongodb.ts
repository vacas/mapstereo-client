import mongoose from 'mongoose';

const connectDB = handler => async (req, res) => {
  if (!mongoose?.connections || mongoose.connections.length === 0 || !mongoose.connections[0].readyState) {
    await mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
  }

  return handler(req, res);
}

export default connectDB;