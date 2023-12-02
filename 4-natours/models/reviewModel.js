const mongoose = require('mongoose');
const Tour = require('./tourModels');
const AppError = require('../utils/appError');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre('save', async function (next) {
  if (!this.tour) {
    next(new AppError('no tour with that Id'));
  }
  const tourExists = await Tour.findById(this.tour);
  if (!tourExists) {
    return next(new AppError('No tour found with that ID', 404));
  }
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  let targetDoc = doc;

  // If the doc is not provided, it's an update operation, so fetch the document
  if (!targetDoc) {
    targetDoc = await this.model.findOne(this.getQuery());
  }

  // Proceed if the document is available
  if (targetDoc) {
    await targetDoc.constructor.calcAverageRatings(targetDoc.tour);
  }
});
// reviewSchema.post(/^findOneAnd/, async function () {
//   // 'this' is the query, so 'this.getQuery()' gives you the query criteria
//   const doc = await this.model.findOne(this.getQuery());
//   if (doc) {
//     await doc.constructor.calcAverageRatings(doc.tour);
//   }
// });
// reviewSchema.post('findOneAndDelete', async function (doc) {
//   if (doc) {
//     await doc.constructor.calcAverageRatings(doc.tour);
//   }
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
