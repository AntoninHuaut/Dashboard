import { connect, createDefaultAdmin } from '/external/db.ts';

connect().then(async () => {
    await createDefaultAdmin();
    await import('/server.ts');
});
