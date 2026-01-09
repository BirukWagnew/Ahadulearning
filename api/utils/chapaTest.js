export const testModeWithdrawal = async ({ account_name, account_number, bank_code, amount }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a reference starting with AHADU
  const reference = `AHADU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Return a successful test response
  return {
    status: 'success',
    message: 'Withdrawal processed successfully in test mode',
    data: reference,
    meta: {
      account_name,
      account_number,
      bank_code,
      amount,
      currency: 'ETB',
      reference,
      narration: 'Instructor Payout (Test Mode)',
      timestamp: new Date().toISOString(),
      isTest: true
    }
  };
};
