 import User from '../../models/User.js';
import { testModeWithdrawal } from '../../utils/chapaTest.js';

 import Withdrawal from '../../models/Withdrawal.js';

export const instructorTestWithdraw = async (req, res) => {
  try {
    const { account_name, account_number, bank_code, amount, bank_name } = req.body;
    
    // 1. Atomically deduct balance
    const updatedInstructor = await User.findOneAndUpdate(
      { _id: req.user._id, availableBalance: { $gte: amount } },
      { $inc: { availableBalance: -amount } },
      { new: true }
    );

    if (!updatedInstructor) {
      // Could be not found, or insufficient balance
      const instructorExists = await User.findById(req.user._id);
      if (!instructorExists) return res.status(404).json({ message: 'Instructor not found' });
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 2. Initiate payout
    let result;
    try {
      result = await testModeWithdrawal({ account_name, account_number, bank_code, amount });
    } catch (apiError) {
      // 3a. Rollback if external API throws an exception
      await User.updateOne({ _id: req.user._id }, { $inc: { availableBalance: amount } });
      console.error('Withdrawal API Error:', apiError.message);
      return res.status(500).json({ error: 'External payment service failed. Balance restored.' });
    }

    const reference = result?.data || `FIDEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3b. Rollback if external API returns a failure status
    if (result.status !== 'success') {
      await User.updateOne({ _id: req.user._id }, { $inc: { availableBalance: amount } });
      
      const failedWithdrawal = await Withdrawal.create({
        user: req.user._id,
        amount,
        reference,
        status: 'failed',
        responseMessage: result.message || 'Payment provider failed',
        bankName: bank_name,
        accountNumber: account_number,
      });

      return res.status(400).json({ 
        message: 'Withdrawal failed. Balance restored.',
        transaction: result,
        withdrawal: failedWithdrawal 
      });
    }

    const newWithdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      reference,
      status: 'success',
      responseMessage: result.message,
      bankName: bank_name,
      accountNumber: account_number,
    });

    return res.status(200).json({
      message: 'Withdrawal successful (test mode)',
      transaction: result,
      remainingBalance: updatedInstructor.availableBalance.toFixed(1),
      withdrawal: newWithdrawal,
    });
  } catch (error) {
    console.error('Withdrawal Processing Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};


export const getWithdrawalHistory = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ withdrawals });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error.message);
    return res.status(500).json({ error: error.message });
  }
};


export const getInstructorBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('availableBalance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the balance to one decimal place
    const formattedBalance = Number(user.availableBalance).toFixed(1);

    return res.status(200).json({
      message: 'Instructor balance retrieved successfully',
      balance: parseFloat(formattedBalance),
    });
  } catch (error) {
    console.error('Error retrieving instructor balance:', error.message);
    return res.status(500).json({ error: error.message });
  }
};


