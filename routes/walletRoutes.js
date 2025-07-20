const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     tags:
 *       - Wallets
 *     description: Get all wallets
 *     responses:
 *       200:
 *         description: List of all wallet entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   member:
 *                     type: string
 *                     description: The ID of the member associated with the wallet
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date-time
 */
router.get('/', walletController.getWallets);

/**
 * @swagger
 * /api/wallets:
 *   post:
 *     tags:
 *       - Wallets
 *     description: Add money to a member's wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member
 *               - amount
 *             properties:
 *               member:
 *                 type: string
 *                 description: The ID of the member whose wallet is being updated (ObjectId of 'Member')
 *               amount:
 *                 type: number
 *                 description: The amount of money to add to the wallet
 *     responses:
 *       201:
 *         description: Money added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 member:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 date:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', walletController.addMoney);

/**
 * @swagger
 * /api/wallets/{id}:
 *   delete:
 *     tags:
 *       - Wallets
 *     description: Delete a wallet entry by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the wallet entry to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Server error during deletion
 */
router.delete('/:id', walletController.deleteWallet);

module.exports = router;
