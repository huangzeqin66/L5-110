import { Router } from 'express';
import AdminController from '../controllers/adminController';

const router = Router();
const adminController = new AdminController();

export const setAdminRoutes = (app) => {
    app.use('/admin', router);
    
    router.post('/reservations', adminController.createReservation);
    router.put('/reservations/:id', adminController.updateReservation);
    router.delete('/reservations/:id', adminController.deleteReservation);
};