import { ContextUser, UserRole } from '/types/user_model.ts';

const hasUserRole = (user: ContextUser, role: UserRole) => user.roles.includes(role);
const hasEveryUserRole = (user: ContextUser, roles: UserRole[]) => roles.every((role: UserRole) => hasUserRole(user, role));
const hasSomeUserRole = (user: ContextUser, roles: UserRole[]) => roles.some((role: UserRole) => hasUserRole(user, role));

export { hasUserRole, hasEveryUserRole, hasSomeUserRole };
