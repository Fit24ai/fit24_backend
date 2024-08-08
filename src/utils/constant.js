const bcrypt = require('bcryptjs');

const formatDate = (selectedDate) => {
  const originalDate = new Date(selectedDate);

  const year = originalDate.getFullYear();
  const month = String(originalDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(originalDate.getDate()).padStart(2, '0');

  // Form the new date string in YYYY-MM-DD format
  const formattedDateString = `${year}-${month}-${day}`;
  console.log('formattedDateString..', formattedDateString);
  return formattedDateString;
};

const encryptPassword = async (newPass) => {
  const hashedPassword = await bcrypt.hash(newPass, 8);
  return hashedPassword;
};

const userStatus = {
  ACTIVE: true,
  IN_ACTIVE: false,
};

const GOALS = ['Lose Weight', 'Gain Weight', 'Muscle Mass Gain', 'Shape Body', 'Others'];
const LEVELS = ['Beginner', 'Intermediate', 'Advance'];

module.exports = { formatDate, userStatus, GOALS, LEVELS, encryptPassword };
