import express from 'express';  // 注意 express 需要用引号包裹，表示字符串字面量

import { setAdminRoutes } from './admin/routes/adminRoutes';
import { setUserRoutes } from './user/routes/userRoutes';
import process from 'process';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setAdminRoutes(app);
setUserRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:3000`);
});