import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "username",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "stau_admin",
  synchronize: process.env.NODE_ENV === "development", // 개발 환경에서만 자동 동기화
  logging: process.env.NODE_ENV === "development",
  entities: [User],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return AppDataSource;
  } catch (error) {
    throw error;
  }
};

export default AppDataSource; 