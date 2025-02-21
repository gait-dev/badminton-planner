import express from 'express';
import contactRouter from './routes/contact';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use('/api/contact', contactRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
