import { app } from "./src/app.js";
import { prisma } from "./src/common/prisma/connect.prisma.js";
import { port } from "./src/common/constants/app.constant.js";

await prisma.$connect();
const server = app.listen(port, () =>
  console.log(`Airbnb API: http://localhost:${port}/swagger`),
);
server.on("error", async (error) => {
  console.error(error.message);
  await prisma.$disconnect();
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () =>
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    }),
  );
}
