const { badRequest, notFound, forbidden } = require("../errors/indexErrors")
const Review = require("../models/review")
const Product = require("../models/product")
const {StatusCodes} = require("http-status-codes")
const checkPermissions = require("../utils/checkpermisions")


const createReview = async (req, res) => {
    const productID = req.body.product
    console.log(req.body);
    
    
    if (!productID) {
        throw new badRequest("please provide the productID")
    }

    const product = await Product.findOne({_id: productID})
    if (!product) {
        throw new notFound("Product with that id not found")
    }

    const alreadyExist = await Review.findOne({
        user: req.user.userID,
        product: productID
    })

    if (alreadyExist) {
        throw new badRequest("you have already posted a review for the product")
    }

    req.body.user = req.user.userID
    req.body.name = req.user.name
    const review = await Review.create(req.body)
    review.after()
    console.log(review);
    
    res.status(StatusCodes.OK).json({msg: review})
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({
        path: "product",
        select: "name, company, price"
    })
    if (!reviews) {
        throw new notFound("no review found")
    }
    
    res.status(StatusCodes.OK).json({msg: reviews, count: reviews.length})
}

const getSingleReview = async (req, res) => {
    const reviewID = req.params.id

    const review = await Review.findOne({_id: reviewID})

    if (!review) {
        throw new notFound("no review with that id exist")
    }

    res.status(StatusCodes.OK).json({msg: review})
}

const updateReview = async (req, res) => {
    const available = await Review.findOne({_id: req.params.id})

    if(!available) {
        throw new notFound("there is no review with that ID to update")
    }

    checkPermissions(req.user.userID, available.user)

    const { rating, title, comment} = req.body
    const review = await Review.findOneAndUpdate(
        {user: req.user.userID, _id: req.params.id}, 
        { rating, title, comment}
    )

    review.after()
    res.status(StatusCodes.OK).json({msg: "update successful"})

}

const deleteReview = async (req, res) => {
    const theUser = req.user.userID

    const review = await Review.findOneAndDelete({_id: req.params.id, user: theUser})
    if (!review) {
        throw new notFound("no review to delete")
    }

    //checkPermissions(req.user.userID, available.user)

    //const review = await Review.findOneAndDelete({_id: req.params.id, user: req.user.userID})

    // checkPermissions(req.user.userID, review.user)
    // await review.remove()
    review.after()
    res.status(StatusCodes.OK).json({msg: "deleted successfully"})
}


const deleteMany = async (req, res) => {
    const review = await Review.deleteMany({product: req.params.id})
    res.status(StatusCodes.OK).json({msg: "you don delete am, your mind don rest now abi"})
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    deleteMany
}