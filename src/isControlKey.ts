import React from "react";

export const isControlKey = (e: React.MouseEvent<any, any>) => {
    return e.ctrlKey || (navigator.userAgent.toUpperCase().includes("MAC") && e.metaKey);
};
