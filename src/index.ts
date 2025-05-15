import { app } from './app';
import env from './config/env';

const port = env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port} in ${env.NODE_ENV} mode`);
});

app.on('error', (err: any) => {
    console.error('Error occurred:', err.message);
});
