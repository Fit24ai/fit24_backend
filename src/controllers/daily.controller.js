const catchAsync = require('../utils/catchAsync');
const { dailyService } = require('../services');

const getDaily = catchAsync(async (req, res) => {
  const result = await dailyService.getDailyData(req.params.userId);
  // Check if result exists and is not empty
  if (result && result.length > 0) {
    res.status(200).json({
      status: 'success',
      message: 'Daily data retrieved successfully',
      data: result,
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Daily data not found',
    });
  }
});

module.exports = {
  getDaily,
};
