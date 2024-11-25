require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const compression = require('compression');
const multer = require("multer");
const fs = require("fs");
const helper = require("./utilities/helper");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const imageRoutes = require("./routes/image");
const productRoutes = require("./routes/product");
const enquiryRoutes = require("./routes/enquiry");
const metalRoutes = require("./routes/metal");
const categoryRoutes = require("./routes/category");
const reviewRoutes = require("./routes/productReview");
const metaTagRoutes = require("./routes/metaTag");
const metalCategoryRoutes = require("./routes/metalCategory");
const orderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/payment");
const blogRoutes = require("./routes/blog");
const couponRoutes = require("./routes/coupon");
const categoryCatalogueRoutes = require("./routes/categoryCatalogue");
const paypal = require("./controllers/paypal-api");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const allowedContentTypes = require("./utilities/contentTypes");
const passport = require("passport"); 
const app = express();
const { User } = require("./models/user");
const { videoSaveToDrive } = require("./utilities/googleDrive");
const responseManager = require("./utilities/responseManager");

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());

// app.use(cors());
app.use(
  cors({
    origin: "*",
    methods: "GET, POST, DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// DB connnection
mongoose.set("runValidators", true);

mongoose
  .connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB CONNECTED."))
  .catch((err) => console.log("Can't connect", err));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", imageRoutes);
app.use("/api", productRoutes);
app.use("/api", enquiryRoutes);
app.use("/api", metalRoutes);
app.use("/api", reviewRoutes);
app.use("/api", categoryRoutes);
app.use("/api", metalCategoryRoutes);
app.use("/api", metaTagRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use("/api", categoryCatalogueRoutes);
app.use("/api", blogRoutes);
app.use("/api", couponRoutes);

app.post("/my-server/create-paypal-order", async (req, res) => {
  try {
    const order = await paypal.createOrder(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/my-server/capture-paypal-order", async (req, res) => {
  const { orderID, orderDetails, address, userid } = req.body;

  const origin = req.headers.origin || req.headers.referer || "";

  // Validate the origin against the allowed domains
  if (!allowedContentTypes.allowedDomains.includes(origin)) {
    return res.status(403).json({
      Message: "Unauthorized origin!",
      Data: 0,
      Status: 403,
      IsSuccess: false
    });
  }

  try {
    const captureData = await paypal.capturePayment(
      orderID,
      orderDetails,
      address,
      userid,
      origin
    );
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//  video compression
const videoStorage = multer.diskStorage({
  destination: 'video/',
  filename: (req, file, cb) => {
      cb(null, file.originalname)
  }
});
const videoUploadCon = multer({
  storage: videoStorage,
  limits: {
    fileSize: 10000000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      return cb(new Error('Please upload a video'))
    }
    cb(undefined, true)
  }
})

app.post('/api/video', helper.isAuthenticated, helper.isAdmin, videoUploadCon.single('file'), async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {

  if (req.file) {
    if (allowedContentTypes.videoarray.includes(req.file.mimetype)) {
      const fileSize = parseFloat(parseFloat(req.file.size) / 1000000);
      if (fileSize <= 25) {
    ffmpeg()
      .input('./video/'+req.file.filename)
      .videoCodec('libx265')
      .audioCodec('libmp3lame')
      .on('end', async  () => {
        await fs.unlink('./video/'+req.file.filename, (err) => {
          if (err) {
            console.log(err);
          }
        });
        const compressedFilePath = './video/' + 'compressed_' + req.file.originalname;
        videoSaveToDrive(
          compressedFilePath,
          fileSize,
          req.file.mimetype,
          req.file.originalname,
          ["1IYbBW6Q0aYQruCjS3aLpGeRx60EApU2n"]
        )
          .then((result) => {
            return responseManager.onSuccess(
              "Video uploaded successfully!",
              {
                url: result.data.id,
              },
              res
            );
          })
          .catch((error) => {
            return responseManager.onError(error, res);
          });
        // return res.status(200).json({
        //   Message: 'Compression finished',
        //   Data: 1,
        //   Status: 200,
        //   IsSuccess: true
        // });
      })
      .on('error', (err) => {
        console.log(err);
        return res.status(400).json({
          Message: err.message,
          Data: 0,
          Status: 400,
          IsSuccess: false
        });
      })
      .save('video/' + 'compressed_'+ req.file.originalname);
     } else {
        return responseManager.badrequest(
          { message: "Video should be <= 25 MB" },
          res
        );
      }
    } else {
      return responseManager.badrequest(
        { message: "Video file type" },
        res
      );
    }
    }else {
    return responseManager.badrequest({ message: "Video file type" }, res);
  }
} else {
  return responseManager.badrequest({ message: "User not verified" }, res);
}
} else {
return responseManager.badrequest(
  { message: "Invalid token to upload video" },
  res
);
}
});
//  PORT
const port = process.env.PORT || 1234;

//  Starting a server
app.listen(port, () => {
  return console.log(`App is running at port ${port}`);
});
