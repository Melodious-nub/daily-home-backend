const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { auth, requireMess, requireMessAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     tags:
 *       - Wallets
 *     description: Get user's wallet transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's wallet transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: string
 *                   mess:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   type:
 *                     type: string
 *                     enum: [deposit, withdrawal, meal_deduction]
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 */
router.get('/', auth, requireMess, walletController.getWallets);

/**
 * @swagger
 * /api/wallets:
 *   post:
 *     tags:
 *       - Wallets
 *     description: Add money to user's wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of money to add to the wallet
 *               description:
 *                 type: string
 *                 description: Optional description for the transaction
 *     responses:
 *       201:
 *         description: Money added successfully
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', auth, requireMess, walletController.addMoney);

/**
 * @swagger
 * /api/wallets/summary:
 *   get:
 *     tags:
 *       - Wallets
 *     description: Get mess wallet summary (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mess wallet summary with user balances
 *       403:
 *         description: Access denied, mess admin required
 */
router.get('/summary', auth, requireMess, requireMessAdmin, walletController.getMessWalletSummary);

/**
 * @swagger
 * /api/wallets/{id}:
 *   delete:
 *     tags:
 *       - Wallets
 *     description: Delete a wallet transaction (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the wallet transaction to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet transaction deleted successfully
 *       403:
 *         description: Access denied, mess admin required
 *       404:
 *         description: Wallet transaction not found
 */
router.delete('/:id', auth, requireMess, requireMessAdmin, walletController.deleteWallet);

module.exports = router;
