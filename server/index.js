import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 5175;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});


