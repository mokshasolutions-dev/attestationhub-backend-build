"use strict";
// import { Request, Response } from 'express';
// import { getAvailableAttestationTypes } from '../services/config/config.service';
// export async function login(req: Request, res: Response) {
//   // however YOU derive owner today
//   // examples:
//   // const owner = req.body.owner;
//   // const owner = req.user.id;
//   // const owner = ssoResponse.userId;
//   const owner = req.body.owner;
//   if (!owner) {
//     return res.status(400).json({ error: 'OWNER_REQUIRED' });
//   }
//   // Run config logic at login time
//   const configResult = await getAvailableAttestationTypes(owner);
//   res.status(200).json({
//     success: true,
//     owner,
//     availableAttestations: configResult.data,
//   });
// }
//# sourceMappingURL=auth.controller.js.map