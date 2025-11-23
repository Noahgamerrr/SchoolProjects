import { logger } from "../logging/log.js";

export const restrictToRoles = (...roles) => {
    return (req, res, next) => {
        if (!res.locals.authJwtMiddlewareHandled)
            throw new Error(
                "restrictToRoles called before authJWTMiddleware. Make sure to register authJWTMiddleware before restrictToRoles.",
            );

        const userRoles = req.roles;

        if (!userRoles)
            logger.debug(
                "User with undefined roles called 'restrictToRoles'. Either this is an unauthenticated request or you forgot to register the authJWT-middleware.",
            );

        // if user has one of the specified roles
        if (userRoles && userRoles.some((r) => roles.includes(r))) {
            next();
        } else {
            logger.debug(
                `RoleRestriction - Unauthorized access attempt ${req.method} ${req.url} by user ${req.authenticatedUser}`,
            );
            res.status(403).type("text/plain").send("Operation not allowed");
        }
    };
};
