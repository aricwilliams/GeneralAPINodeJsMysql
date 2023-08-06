const express = require("express");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const port = 3001;
const myRouter = require("./routes/routes.js");
const swaggerDocument = require("./swagger_output.json");

app.use(helmet());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to Roomie Haven API... enter a rout destination to get started!",
  });
});

app.use("/listings", myRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
