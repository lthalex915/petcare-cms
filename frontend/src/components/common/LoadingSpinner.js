import { jsx as _jsx } from "react/jsx-runtime";
export default function LoadingSpinner() {
    return (_jsx("div", { style: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
            fontSize: 12
        }, children: "Loading..." }));
}
