import { Router } from 'express';
import UserController from '../controllers/userController';

const userRouter = Router();
const userController = new UserController();

export function setUserRoutes(app: Router) {
    app.use('/user', userRouter);
    userRouter.post('/reservation', userController.makeReservation.bind(userController));
    userRouter.get('/reservations', userController.viewReservations.bind(userController));
}