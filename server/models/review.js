const mongoose = require("mongoose")
const { trim } = require("validator")
const product = require("./product")

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "please provide the rating"]
    },

    title: {
        type: String,
        trim: true,
        maxlength: 100
    },

    comment: {
        type: String,
        required: [true, "please provide your comment for the review"]
    },
    
    name: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true
    }
},

{timestamps: true}
)

ReviewSchema.index({product: 1, user: 1}, {unique: true})

ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          numOfReviews: { $sum: 1 },
        },
      },
    ]);
    console.log(`this is result: ${result}`);

    try {
      await this.model('Product').findOneAndUpdate(
        {_id: productId},
        {
          averageRating: Math.ceil(result[0]?.averageRating || 0),
          numberOfReviews: result[0]?.numOfReviews || 0
        }
      )
    } catch (error) {
      console.log(`this is the error: ${error}`)
    }
  };

  ReviewSchema.methods.after = async function() {
    await this.constructor.calculateAverageRating(this.product)
  }


module.exports = mongoose.model("Review", ReviewSchema)