import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connect } from 'mongoose';
import {connectDB} from './config/db.js'
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'


const app = express();
const port = process.env.PORT || 4000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// DB Connection
connectDB();

// Routes
app.use("/api/user",userRouter);
app.use("/api/tasks", taskRouter);

app.get('/', (req,res) => {
    res.send('API Working');
})

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)

})