import { httpErrors } from "oak";
import * as userRepo from "/repositories/user_repository.ts";
import { UserRole } from "/types/user_model.ts";
import { hash } from "/utils/hash_helper.ts";

const getUsers = async () => {
  return await userRepo.getUsers();
};

const getUserById = async (id: number) => {
  const user = await userRepo.getUserById(id);
  if (!user) {
    throw new httpErrors.NotFound("User not found");
  }

  return user;
};

const getUserByEmail = async (email: string) => {
  const user = await userRepo.getUserByEmail(email);
  if (!user) {
    throw new httpErrors.NotFound("User not found");
  }

  return user;
};

const createUser = async (
  email: string,
  username: string,
  password: string,
) => {
  const testUser = await userRepo.getUserByEmail(email);
  if (testUser) {
    throw new httpErrors.BadRequest("User already exists");
  }

  const hashPassword = await hash(password);

  return await userRepo.createUser(email, username, hashPassword, [
    UserRole.USER,
  ]);
};

const updateUser = async (
  id: number,
  password: string,
) => {
  const testUser = await userRepo.getUserById(id);
  if (!testUser) {
    throw new httpErrors.NotFound("User not found");
  }

  const hashPassword = await hash(password);
  return await userRepo.updateUser(id, hashPassword);
};

const deleteUser = async (id: number) => {
  const testUser = await userRepo.getUserById(id);
  if (!testUser) {
    throw new httpErrors.NotFound("User not found");
  }

  return await userRepo.deleteUser(id);
};

export {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
};
