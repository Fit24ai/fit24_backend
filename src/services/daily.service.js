const httpStatus = require('http-status');
const axios = require('axios');
const DailyModel = require('../models/daily.model');
const ApiError = require('../utils/ApiError');

const handleDaily = async (bodyData) => {
  try {
    const newData = new DailyModel(bodyData);
    await newData.save();
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error saving webhook data');
  }
};

const getStepsDataOld = async (userId) => {
  console.log(userId);
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': userId, // Match documents with the specified user ID
        },
      },
      {
        $project: {
          _id: 1,
          step_samples: '$distance_data.detailed.step_samples',
        },
      },
    ];

    const results = await DailyModel.aggregate(pipeline);

    if (results.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No data found for the specified user ID');
    }

    const classifyActivity = (steps, duration) => {
      const pace = steps / duration; // pace in steps per second
      if (pace < 1.5) return 'walking';
      if (pace < 2.5) return 'jogging';
      return 'running';
    };

    const classifiedResults = results.map((result) => {
      const stepSamples = result.step_samples || [];

      const activities = stepSamples.reduce(
        (acc, sample) => {
          const { timer_duration_seconds: duration, steps, timestamp } = sample;
          const activity = classifyActivity(steps, duration);

          const classifiedActivity = {
            timestamp,
            duration_seconds: duration,
            steps,
            activity,
          };

          acc[activity.toLowerCase()].push(classifiedActivity);
          return acc;
        },
        { walking: [], jogging: [], running: [] }
      );

      return {
        _id: result._id,
        ...activities,
      };
    });

    return classifiedResults;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      throw error;
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting daily data');
    }
  }
};

const getDailyData = async (params) => {
  console.log(params.userId);
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': params.userId,
        },
      },
      {
        $project: {
          _id: 1,
          steps: '$distance_data.steps',
        },
      },
    ];

    // Optionally add $match stages for startDate and endDate if provided
    if (params.startDate) {
      pipeline.push({
        $match: {
          'metadata.start_time': { $gte: new Date(params.startDate) },
        },
      });
    }

    if (params.endDate) {
      pipeline.push({
        $match: {
          'metadata.end_time': { $lte: new Date(params.endDate) },
        },
      });
    }

    const result = await DailyModel.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting daily data');
  }
};
const updateDailyWebhook = async (userId, startDate, endDate) => {
  const options = {
    method: 'GET',
    url: `https://api.tryterra.co/v2/daily?user_id=${userId}&start_date=${startDate}&end_date=${endDate}&to_webhook=true&with_samples=true`,
    headers: {
      accept: 'application/json',
      'dev-id': process.env.DEV_ID,
      'content-type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
  };

  try {
    const response = await axios(options);
    const result = response.data;
    return result;
  } catch (error) {
    if (error.response && error.response.status === httpStatus.NOT_FOUND) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Resource not found');
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching daily data');
    }
  }
};
const updateDailyData = async (dailyData, userId) => {
  const { steps, timerDurationSeconds, caloriesData, timestamp, distance } = dailyData;

  const startTime = new Date(timestamp);
  startTime.setHours(0, 0, 0, 0);
  const startTimeStr = startTime.toISOString();
  console.log(dailyData, userId, new Date(timestamp).toISOString());

  const classifyActivity = (_steps, _duration) => {
    const pace = _steps / _duration; // pace in steps per second
    if (pace < 2.5) return 'walking';
    return 'running';
  };
  const aggregationPipeline = [
    {
      $match: {
        '_id.user_id': userId.toString(),
        '_id.start_time': startTimeStr,
      },
    },
    {
      $project: {
        _id: null,
        total_calories: { $sum: '$calories_data.calorie_samples.calories' },
        total_timer_duration_seconds: { $sum: '$calories_data.calorie_samples.timer_duration_seconds' },
        steps: '$distance_data.steps',
        distance_meters: '$distance_data.distance_meters',
      },
    },
  ];
  const aggregationResult = await DailyModel.aggregate(aggregationPipeline).exec();

  let totalCalories = 0;
  let totalTimerDurationSeconds = 0;
  let totalSteps = 0;
  let totalDdistanceMeters = 0;

  if (aggregationResult.length > 0) {
    totalCalories = aggregationResult[0].total_calories || 0;
    totalTimerDurationSeconds = aggregationResult[0].total_timer_duration_seconds || 0;
    totalSteps = aggregationResult[0].steps || 0;
    totalDdistanceMeters = aggregationResult[0].distance_meters || 0;
  }

  // Calculate new totals
  const newTotalCalories = totalCalories + Number(caloriesData);
  const newTotalSteps = totalSteps + Number(steps);

  const newTotalDdistanceMeters = totalDdistanceMeters + Number(distance);

  const newTotalTimerDurationSeconds = totalTimerDurationSeconds + Number(timerDurationSeconds);
  const activity = classifyActivity(steps, timerDurationSeconds);

  const newData = {
    $inc: {
      'distance_data.steps': Number(steps),
      'distance_data.timer_duration_seconds': Number(timerDurationSeconds),
      'distance_data.distance_meters': Number(distance),
      'calories_data.total_burned_calories': Number(caloriesData),
      'calories_data.timer_duration_seconds': Number(timerDurationSeconds),
    },
    $push: {
      'distance_data.detailed.step_samples': {
        timestamp: new Date(timestamp).toISOString(),
        timer_duration_seconds: newTotalTimerDurationSeconds,
        steps: Number(newTotalSteps),
        action: activity,
      },
      'distance_data.detailed.distance_samples': {
        timestamp: new Date(timestamp).toISOString(),
        timer_duration_seconds: newTotalTimerDurationSeconds,
        steps: Number(newTotalDdistanceMeters),
      },
      'calories_data.calorie_samples': {
        timestamp: new Date(timestamp).toISOString(),
        calories: Number(newTotalCalories),
        timer_duration_seconds: newTotalTimerDurationSeconds,
      },
    },
  };

  try {
    const result = await DailyModel.findOneAndUpdate(
      { '_id.user_id': userId.toString(), '_id.start_time': startTimeStr },
      newData,
      {
        upsert: true,
        new: true,
      }
    );

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Resource not found');
    }
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else {
      console.error('Error fetching daily data:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching daily data');
    }
  }
};
const getStepsMonthly = async (params) => {
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': params.userId, // Match documents with the specified user ID
        },
      },
      {
        $addFields: {
          start_time_date: { $toDate: '$_id.start_time' }, // Convert start_time to Date type
        },
      },
      {
        $project: {
          month: { $month: '$start_time_date' },
          year: { $year: '$start_time_date' },
          steps: '$distance_data.steps',
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalSteps: { $sum: '$steps' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ];
    const results = await DailyModel.aggregate(pipeline).exec();
    if (results.length === 0) {
      return 0;
    }

    const formattedResults = results.map((result) => ({
      year: result._id.year,
      month: result._id.month,
      totalSteps: result.totalSteps,
    }));

    return formattedResults;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getStepsWeekly = async (params) => {
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': params.userId, // Match documents with the specified user ID
          ...(params.action && {
            'distance_data.detailed.step_samples.action': params.action,
          }),
        },
      },
      {
        $addFields: {
          start_time_date: { $toDate: '$_id.start_time' }, // Convert start_time to Date type
          dayOfWeek: { $dayOfWeek: { $toDate: '$_id.start_time' } }, // Extract the day of the week
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$start_time_date' }, // Format date to "YYYY-MM-DD"
          },
          dayOfWeek: '$dayOfWeek',
          steps: '$distance_data.steps',
          timerDurationSeconds: '$distance_data.timer_duration_seconds',
        },
      },
      {
        $group: {
          _id: { date: '$date', dayOfWeek: '$dayOfWeek' },
          totalSteps: { $sum: '$steps' },
          totalTimerDurationSeconds: { $sum: '$timerDurationSeconds' },
        },
      },
      {
        $sort: {
          '_id.date': -1, // Sort by date in ascending order
        },
      },
      {
        $limit: 7, // Limit the results to the 7 most recent entries
      },
    ];

    const results = await DailyModel.aggregate(pipeline).exec();
    if (results.length === 0) {
      return [];
    }

    const dayMap = {
      1: 'Sunday',
      2: 'Monday',
      3: 'Tuesday',
      4: 'Wednesday',
      5: 'Thursday',
      6: 'Friday',
      7: 'Saturday',
    };

    const formattedResults = results.map((result) => ({
      date: result._id.date,
      day: dayMap[result._id.dayOfWeek],
      totalSteps: result.totalSteps,
      totalTimerDurationSeconds: result.totalTimerDurationSeconds,
      action: params.action,
    }));
    const currentDate = new Date().toISOString().split('T')[0];
    if (formattedResults.length > 0 && formattedResults[0].date === currentDate) {
      formattedResults.shift();
    }
    return formattedResults;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getStepsData = async (userId) => {
  console.log(userId);
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': userId, // Match documents with the specified user ID
        },
      },
      {
        $project: {
          _id: 1,
          step_samples: '$distance_data.detailed.step_samples',
        },
      },
    ];

    const results = await DailyModel.aggregate(pipeline);

    if (results.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No data found for the specified user ID');
    }

    const walkingThreshold = 1.5; // steps per second
    const joggingThreshold = 2.5; // steps per second

    const classifyActivity = (stepsPerSecond) => {
      if (stepsPerSecond <= walkingThreshold) {
        return 'walking';
      }
      if (stepsPerSecond <= joggingThreshold) {
        return 'jogging';
      }
      return 'running';
    };

    const classifiedResults = results.map((result) => {
      const stepSamples = result.step_samples || [];

      const activities = stepSamples.reduce(
        (acc, currentSample, index, arr) => {
          if (index === 0) return acc; // Skip the first element since there's no previous sample to compare

          const prevSample = arr[index - 1];
          const timeDiffSeconds = (new Date(currentSample.timestamp) - new Date(prevSample.timestamp)) / 1000;
          const stepsDiff = currentSample.steps - prevSample.steps;
          const stepsPerSecond = stepsDiff / timeDiffSeconds;
          const activity = classifyActivity(stepsPerSecond);

          const classifiedActivity = {
            timestamp: currentSample.timestamp,
            duration_seconds: timeDiffSeconds,
            steps: stepsDiff,
            stepsPerSecond,
            activity,
          };

          acc[activity.toLowerCase()].push(classifiedActivity);
          return acc;
        },
        { walking: [], jogging: [], running: [] }
      );

      return {
        _id: result._id,
        ...activities,
      };
    });

    return classifiedResults;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      throw error;
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting daily data');
    }
  }
};

const getStepsDaily = async (params) => {
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': params.userId,
          '_id.start_time': { $eq: new Date(params.startDate).toISOString() },
        },
      },
      {
        $project: {
          distance_data: '$distance_data',
          calories_data: '$calories_data',
        },
      },
    ];

    const results = await DailyModel.aggregate(pipeline).exec();
    if (results.length === 0) {
      return { distance_data: [], calories_data: [] }; // Ensure the structure matches your return type
    }

    const walkingThreshold = 2.5; // steps per second
    // const joggingThreshold = 2.5; // steps per second

    const classifyActivity = (stepsPerSecond) => {
      if (stepsPerSecond <= walkingThreshold) {
        return 'walking';
      }
      // if (stepsPerSecond <= joggingThreshold) {
      //   return 'jogging';
      // }
      return 'running';
    };

    const classifiedResults = results.map((result) => {
      const stepSamples = result.distance_data.detailed?.step_samples || []; // Use optional chaining to avoid errors if `detailed` is undefined

      const activities = stepSamples.reduce(
        (acc, currentSample, index, arr) => {
          if (index === 0) return acc; // Skip the first element since there's no previous sample to compare

          const prevSample = arr[index - 1];
          const timeDiffSeconds = currentSample.timer_duration_seconds - prevSample.timer_duration_seconds;
          const stepsDiff = currentSample.steps - prevSample.steps;
          const stepsPerSecond = stepsDiff / timeDiffSeconds;
          const activity = classifyActivity(stepsPerSecond);

          const classifiedActivity = {
            timestamp: currentSample.timestamp,
            duration_seconds: timeDiffSeconds,
            steps: stepsDiff,
            activity,
          };

          acc[activity.toLowerCase()].push(classifiedActivity);
          return acc;
        },
        { walking: [], jogging: [], running: [] }
      );

      return {
        _id: result._id,
        distance_data: {
          detailed: activities,
        },
        calories_data: result.calories_data, // Include the calories data
      };
    });

    return classifiedResults;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      throw error;
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting daily data');
    }
  }
};

module.exports = {
  handleDaily,
  getDailyData,
  getStepsData,
  updateDailyWebhook,
  updateDailyData,
  getStepsDataOld,
  getStepsMonthly,
  getStepsWeekly,
  getStepsDaily,
};
