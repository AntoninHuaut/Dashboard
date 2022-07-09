import { ContextUser, UserRole } from "/types/user_model.ts";

const hasUserRole = (user: ContextUser, roles: UserRole[]) =>
  roles.some((role: UserRole) => user.roles.includes(role));

export { hasUserRole };
