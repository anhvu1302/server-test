function leastConnection(cluster, app) {
  const workers = Object.values(cluster.workers);
  const connections = {};

  workers.forEach(worker => {
    connections[worker.id] = 0;
    worker.on('message', (msg) => {
      if (msg.type === 'connection') {
        connections[worker.id]++;
      } else if (msg.type === 'disconnection') {
        connections[worker.id]--;
      }
    });
  });

  app.use((req, res, next) => {
    let minWorker = workers[0];
    workers.forEach(worker => {
      if (connections[worker.id] < connections[minWorker.id]) {
        minWorker = worker;
      }
    });
    minWorker.send({ type: 'request', pid: process.pid });
    next();
  });
}

const roundRobin = (cluster) => {
  // Listen for dying workers
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  let workerIndex = 0;
  const workers = Object.values(cluster.workers);

  // Round Robin implementation
  setInterval(() => {
    workers[workerIndex].send("ping");
    workerIndex = (workerIndex + 1) % workers.length;
  }, 1000); // Ping every second
};

module.exports = {
  leastConnection,
  roundRobin,
};
