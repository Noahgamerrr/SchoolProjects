import { restrictToRoles } from "./restrict-to-roles.js";
import { ROLE_ADMIN, ROLE_TEACHER, ROLE_PUPIL } from "../auth/roles.js";
import { Student } from "../api/students/students-model.js";

/**
 *
 * @param {string} idParam
 */
export const studentOwnEndpoint = (idParam) => {
    if (!idParam) idParam = "id";
    return async (req, res, next) => {
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_PUPIL)(
            req,
            res,
            async () => {
                // If the user is not teacher or admin, he can only access his own data
                if (
                    !req.roles.includes(ROLE_TEACHER) &&
                    !req.roles.includes(ROLE_ADMIN)
                ) {
                    if (
                        req.authenticatedUser &&
                        (
                            await Student.findById(req.params[idParam])
                        ).shortform.split("@")[0] !==
                            req.authenticatedUser.split("@")[0]
                    ) {
                        return res.status(403).send("Forbidden");
                    }
                }

                next();
            }
        );
    };
};
