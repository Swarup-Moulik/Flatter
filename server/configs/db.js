import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=>console.log('Database Connected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/flatter`);
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;