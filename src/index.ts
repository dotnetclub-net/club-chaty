import errorHandler from "errorhandler";
import app from "./web/app";

const port = process.env.PORT || 3000


// Error Handler. Provides full stack - remove for production
app.use(errorHandler());

const server = app.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;