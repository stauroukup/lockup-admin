import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "username",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "stau_admin",
  synchronize: false, // 프로덕션에서는 false로 설정
  logging: true,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

export default AppDataSource; 