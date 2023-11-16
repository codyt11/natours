const express = require('express');
const userControllers = require('../controllers/userControllers');
const router = express.Router();

router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.newUser);
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.editUser)
  .delete(userControllers.deleteUser);

module.exports = router;
