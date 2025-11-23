import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * @type {React.FC<{collapsed: boolean; text: string; href: string; onClick: () => void; icon: string; customActiveUrlChecker: (actualPathname: string, linkValue: string) => boolean;}>}
 */
const SideBarButton = ({
    collapsed,
    text,
    href,
    onClick,
    icon,
    customActiveUrlChecker,
}) => {
    const { pathname: actualPathname } = useLocation();

    const [isActiveUrl, setIsActiveUrl] = useState(false);

    useMemo(() => {
        if (!customActiveUrlChecker)
            setIsActiveUrl(actualPathname.slice(1).startsWith(href));
        else setIsActiveUrl(customActiveUrlChecker(actualPathname, href));
    }, [actualPathname, href, customActiveUrlChecker]);

    return (
        <NavLink
            to={href}
            className={
                "text-decoration-none " +
                (collapsed ? "d-none d-sm-inline-block" : "d-inline-block")
            }
        >
            <button
                className={
                    "btn d-flex flex-row flex-nowrap" +
                    (isActiveUrl ? " text-primary" : "")
                }
                onClick={onClick}
                type="button"
            >
                {collapsed ?
                    <span className="align-items-center justify-content-center w-100">
                        <i className={icon}></i>
                    </span>
                :   <>
                        <span className="d-flex align-items-center">
                            <i className={icon}></i>
                        </span>
                        <span className="d-flex align-items-center ps-3">
                            <span
                                className="border-end border-secondary d-inline-block"
                                style={{
                                    height: "1.5em",
                                }}
                            ></span>
                        </span>
                        <span className="ps-3 flex-grow-1 text-start">
                            {text}
                        </span>
                    </>
                }
            </button>
        </NavLink>
    );
};

SideBarButton.propTypes = {
    collapsed: PropTypes.bool,
    text: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string,
    customActiveUrlChecker: PropTypes.func,
};

export default SideBarButton;
