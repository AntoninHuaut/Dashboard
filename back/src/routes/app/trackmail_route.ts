import { Router } from 'oak';

import userGuard from '../../middlewares/userguard_middleware.ts';
import { UserRole } from '../../types/user_model.ts';

const trackMailRouter = new Router();

trackMailRouter.get('/token', userGuard([UserRole.USER]), async (ctx) => {});

export default trackMailRouter;
