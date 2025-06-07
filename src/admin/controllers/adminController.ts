import { Request, Response } from 'express';
import { ReservationService } from '../../services/reservationService';
import { Reservation } from '../../types';

const reservationService = new ReservationService();

export default class AdminController {
    createReservation(req: Request, res: Response) {
        const { userId, date, status } = req.body;
        if (!userId || !date) {
            return res.status(400).json({ message: 'userId 和 date 必填' });
        }
        const reservation: Reservation = {
            id: Date.now().toString(),
            userId,
            date: new Date(date),
            status: status || 'pending',
        };
        reservationService.addReservation(reservation);
        res.status(201).json({ message: '预约创建成功', reservation });
    }

    updateReservation(req: Request, res: Response) {
        const { id } = req.params;
        const { date, status } = req.body;
        const reservations = reservationService.getReservations();
        const reservation = reservations.find(r => r.id === id);
        if (!reservation) {
            return res.status(404).json({ message: '预约未找到' });
        }
        if (date) reservation.date = new Date(date);
        if (status) reservation.status = status;
        res.json({ message: '预约已更新', reservation });
    }

    deleteReservation(req: Request, res: Response) {
        const { id } = req.params;
        reservationService.removeReservation(Number(id));
        res.json({ message: '预约已删除' });
    }

    // 支持分页和条件筛选
    listReservations(req: Request, res: Response) {
        let { page = 1, pageSize = 10, userId, status, date } = req.query;
        page = Number(page);
        pageSize = Number(pageSize);
        let reservations = reservationService.getReservations();
        if (userId) {
            reservations = reservations.filter(r => r.userId === userId);
        }
        if (status) {
            reservations = reservations.filter(r => r.status === status);
        }
        if (date) {
            const d = new Date(date as string).toDateString();
            reservations = reservations.filter(r => new Date(r.date).toDateString() === d);
        }
        const total = reservations.length;
        const paged = reservations.slice((page - 1) * pageSize, page * pageSize);
        res.json({ total, page, pageSize, data: paged });
    }

    // 批量删除预约
    batchDeleteReservations(req: Request, res: Response) {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: 'ids 必须为数组' });
        }
        ids.forEach((id: string) => reservationService.removeReservation(Number(id))); // id 类型应与 removeReservation 参数一致
        res.json({ message: '批量删除成功' });
    }

    // 导出预约数据为 CSV
    exportReservations(req: Request, res: Response) {
        const reservations = reservationService.getReservations();
        const header = 'id,userId,date,status\n';
        const rows = reservations.map(r => `${r.id},${r.userId},${new Date(r.date).toISOString()},${r.status}`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reservations.csv"');
        res.send(header + rows);
    }

    getReservation(req: Request, res: Response) {
        const { id } = req.params;
        const reservations = reservationService.getReservations();
        const reservation = reservations.find(r => r.id === id);
        if (!reservation) {
            return res.status(404).json({ message: '预约未找到' });
        }
        res.json(reservation);
    }
}