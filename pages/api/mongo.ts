import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/middleware/mongodb'; 
import Box from '../../lib/db/model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const currentBox = new Box({ name: 'New Hello' });
      currentBox.save().then(() => console.log('meow'));

      res.status(200).json(currentBox);
      return;
    } catch(e) {
      if (e) console.log('e', e);
      res.status(404);
      return;
    }
  }

  res.status(400).json({ error: 'empty' });
  return;
}

export default connectDB(handler);