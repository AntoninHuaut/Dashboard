import * as bcrypt from "bcrypt";

const hash = async (password: string) => {
  return await bcrypt.hash(password);
};

const compare = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export { compare, hash };
