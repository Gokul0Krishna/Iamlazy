import express from 'express';
import fetchRoute from './routes/fetchRoutes.js';
import processRoute from './routes/processRoutes.js';
const app = express();

app.use("/api/fetch",fetchRoute);
app.use("/api/process",processRoute);