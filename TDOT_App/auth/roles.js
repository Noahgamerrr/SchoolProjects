export const ROLE_ADMIN = "admin";
export const ROLE_WORKER = "worker";
export const ROLE_APPOWNER = "appowner";
export const ROLE_GUIDE = "guide";
export const ROLE_PUPIL = "pupil";
export const ROLE_STATIONWORKER = "stationworker";
export const ROLE_TEACHER = "teacher";
export const ROLE_TEAMLEAD = "teamlead";
export const ROLE_TRUSTED = "trusted"

export function hasRole(req, ...roles) {
    if (!Array.isArray(req.roles)) return false;

    // console.log(req.roles, roles);
    for (let role of roles) {
        if (req.roles.includes(role)) {
            return true;
        }
    }
    return false;
}
