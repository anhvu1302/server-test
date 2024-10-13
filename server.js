const cluster = require("cluster");
const os = require("os");
const { sequelize } = require("./models");
const app = require("./app");
const { roundRobin, leastConnection } = require("./loadBalancing");
require("dotenv").config();

const loadBalancingAlgorithm =
  require("./config/loadBalancingConfig.json").LeastConnection; // Change load balancing algorithm here

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  (async () => {
    try {
      await sequelize.authenticate();
      console.log("Connected to database successfully!");

      if (loadBalancingAlgorithm) {
        // Fork workers
        for (let i = 0; i < 2; i++) {
          cluster.fork();
        }

        if (loadBalancingAlgorithm === "LeastConnection") {
          leastConnection(cluster, app);
        } else if (loadBalancingAlgorithm === "RoundRobin") {
          roundRobin(cluster);
        } else {
          throw new Error("Unsupported load balancing algorithm specified.");
        }
      } else {
        cluster.fork();
      }
    } catch (error) {
      console.error("Failed to connect to database.");
      process.exit(1);
    }
  })();
} else {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(
      `Worker ${process.pid} started and listening on port http://localhost:${port}`
    );
  });

  process.on("message", (msg) => {
    if (msg === "ping") {
      // Do something if needed
    }
  });
}
