# 🏡 Home Management App – Backend (Express + MongoDB)

This is the **backend** for the Home Management App – a full-stack solution to manage **shared house rent**, **meal costs**, and **wallet balances** among roommates.

> 💡 The backend is built with **Node.js + Express**, and uses **MongoDB** for data storage (hosted locally). The frontend (Angular) connects via REST API and is served globally using **ngrok**.

---

## 📌 Project Purpose

To simplify monthly rent and meal cost sharing in shared housing environments. Track member contributions, expenses, meals, and generate detailed reports easily — all hosted from your own PC.

---

## 🔧 Features

### 👥 1. House Member Management
- Add/Edit/Delete members
- Assign each member to a room

### 🏠 2. House Setup
- Define rooms (e.g., Room A, Room B)
- Set room-wise rent split percentage (e.g., Room A = 60%, Room B = 40%)
- Divide total rent across rooms and then per person within shared rooms

### 💰 3. Meal Wallet & Costing
- Members can add money to their wallet (with full transaction history)
- Admin can input daily bazar cost (date, amount, description)
- Admin enters meal count per person per day
- Calculates:
  - Total meals
  - Meal rate = (Total Bazar Cost / Total Meals)
  - Meal cost per member based on meals eaten
  - Deducts meal cost from wallet

### 📊 4. Reporting
- Wallet balance for each member
- Daily or Monthly meal reports
- Monthly rent per person
- Summary data (total bazar, total meals, cost per meal, etc.)
- Filter data by date range (from - to)

### 🌐 5. Hosting & Access
- Backend runs on local machine (`localhost:3000`)
- Frontend (Angular) runs at `localhost:4200`
- Use [ngrok](https://ngrok.com/) to expose frontend publicly for global access

---

## 🚀 Optional Features (Coming Soon)
- Authentication (Admin PIN/Password)
- PDF Report Download
- Monthly Archive & Reset
- Export/Import database as JSON

---

## 🧰 Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | Angular, Angular Material     |
| Backend    | Node.js, Express              |
| Database   | MongoDB (local instance)      |
| APIs       | REST (JSON over HTTP)         |
| Charts     | `ngx-charts` (for reports)    |
| Public URL | [ngrok](https://ngrok.com/)   |

---

## 🛠️ Setup Instructions (Backend)

### 1. Install dependencies
```bash
npm install