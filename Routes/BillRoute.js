const express = require("express");
const auth = require("../Middleware/authMiddleware");
const { createBill, getAllBills, getBillById, updateBillStatus } = require("../Controllers/BillController");
const router = express.Router();

// ===============Get All Bills ===============
router.get('/all',auth,getAllBills)
// ===============Get Bill by ID ===============
router.get('/:id',auth,getBillById)
// ===============Create a Bill ===============
router.post('/create',auth,createBill)
// ===============Update Bill Status ===============
router.patch('/update/:id',auth,updateBillStatus)

module.exports = router;