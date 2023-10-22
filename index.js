require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const ApiError = require("./utils/ApiError");
const errorHandler = require("./controllers/ErrorController");

const router = require("./routes");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan("dev"));

app.use(router);

app.all("*", (req, res, next) => {
  next(new ApiError("Routes doesn't exist", 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server sedang berjalan di port: ${PORT}`);
});
