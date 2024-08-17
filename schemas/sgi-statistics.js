import mongoose from 'mongoose';

const sgiStats = new mongoose.Schema({
    launched: {
        type: Number,
        required: true,
    },
    idle: {
        type: Number,
        required: true,
    },
    achievement: {
        type: Number,
        required: true,
    },
});

export default mongoose.models.sgiStatistics || mongoose.model('sgiStatistics', sgiStats);