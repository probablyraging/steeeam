import mongoose from 'mongoose';
import sgiStatistics from '@/schemas/sgi-statistics';

let connection = {};

export default async function POST(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).send('ok');
    }

    if (req.method === 'POST') {
        try {
            if (!connection.isConnected) {
                mongoose.set('strictQuery', true);
                const db = await mongoose.connect(process.env.DB_PATH, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                connection.isConnected = db.connections[0].readyState;
                console.log('Connected to database');
            }

            const type = req.body.data.type;

            const update = { $inc: { [type]: 1 } };
            const options = { new: true, upsert: true };

            const result = await sgiStatistics.findOneAndUpdate({}, update, options);

            return res.status(200).json(result);
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}