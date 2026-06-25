import { Router } from 'express';
import { Snack } from '../models';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const type = typeof req.query.type === 'string' ? req.query.type : undefined;
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const where = {
            ...(type ? { type } : {}),
            ...(status ? { status } : {}),
        };

        const snacks = await Snack.findAll({ where, order: [['type', 'ASC'], ['name', 'ASC']] });
        res.json(snacks);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load snacks', error });
    }
});

router.get('/:snackId', async (req, res) => {
    try {
        const snack = await Snack.findByPk(Number(req.params.snackId));
        if (!snack) {
            res.status(404).json({ message: 'Snack not found' });
            return;
        }

        res.json(snack);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load snack', error });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, type, price, status } = req.body;
        if (!name || !type || !price) {
            res.status(400).json({ message: 'name, type, and price are required' });
            return;
        }

        const snack = await Snack.create({ name, type, price, status });
        res.status(201).json(snack);
    } catch (error) {
        res.status(500).json({ message: 'Cannot create snack', error });
    }
});

router.put('/:snackId', async (req, res) => {
    try {
        const snack = await Snack.findByPk(Number(req.params.snackId));
        if (!snack) {
            res.status(404).json({ message: 'Snack not found' });
            return;
        }

        await snack.update(req.body);
        res.json(snack);
    } catch (error) {
        res.status(500).json({ message: 'Cannot update snack', error });
    }
});

router.delete('/:snackId', async (req, res) => {
    try {
        const snack = await Snack.findByPk(Number(req.params.snackId));
        if (!snack) {
            res.status(404).json({ message: 'Snack not found' });
            return;
        }

        await snack.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Cannot delete snack', error });
    }
});

export default router;
