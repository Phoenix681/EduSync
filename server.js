import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';


connectDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/users', userRoutes);


app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});