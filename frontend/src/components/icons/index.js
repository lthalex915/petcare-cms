import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function IconBase({ size = 24, color = "currentColor", strokeWidth = 1.5, children }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: strokeWidth, children: children }));
}
export function IconHospital(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("path", { d: "M12 2L12 22M2 12L22 12" }), _jsx("circle", { cx: "12", cy: "12", r: "10" })] }));
}
export function IconPaw(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("circle", { cx: "7", cy: "10", r: "2" }), _jsx("circle", { cx: "17", cy: "10", r: "2" }), _jsx("path", { d: "M4 16C4 16 6 20 12 20C18 20 20 16 20 16" })] }));
}
export function IconFood(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("ellipse", { cx: "12", cy: "14", rx: "8", ry: "4" }), _jsx("path", { d: "M4 14C4 14 4 18 12 18C20 18 20 14 20 14" })] }));
}
export function IconHeart(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("path", { d: "M3 12H6L9 7L12 17L15 10L18 14L21 12" }), _jsx("circle", { cx: "12", cy: "12", r: "10" })] }));
}
export function IconActivity(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("circle", { cx: "15", cy: "6", r: "2" }), _jsx("path", { d: "M9 22L11 16L8 14L10 8L13 11L16 10L18 14" })] }));
}
export function IconAlert(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("path", { d: "M12 2L2 22H22L12 2Z" }), _jsx("line", { x1: "12", y1: "9", x2: "12", y2: "14" }), _jsx("circle", { cx: "12", cy: "17", r: "1" })] }));
}
export function IconBox(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("rect", { x: "4", y: "8", width: "16", height: "12", rx: "2" }), _jsx("path", { d: "M8 8V6C8 4 9 3 12 3C15 3 16 4 16 6V8" })] }));
}
export function IconClipboard(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("rect", { x: "6", y: "3", width: "12", height: "18", rx: "2" }), _jsx("line", { x1: "9", y1: "8", x2: "15", y2: "8" }), _jsx("line", { x1: "9", y1: "12", x2: "15", y2: "12" }), _jsx("line", { x1: "9", y1: "16", x2: "12", y2: "16" })] }));
}
export function IconStar(props) {
    return (_jsx(IconBase, { ...props, children: _jsx("path", { d: "M12 2L15 9H22L16 14L18 22L12 17L6 22L8 14L2 9H9L12 2Z" }) }));
}
export function IconCalendar(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }), _jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" }), _jsx("line", { x1: "8", y1: "3", x2: "8", y2: "7" }), _jsx("line", { x1: "16", y1: "3", x2: "16", y2: "7" })] }));
}
export function IconDashboard(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }), _jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }), _jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }), _jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" })] }));
}
export function IconReport(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("path", { d: "M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" }), _jsx("path", { d: "M14 2V8H20" }), _jsx("line", { x1: "8", y1: "13", x2: "16", y2: "13" }), _jsx("line", { x1: "8", y1: "17", x2: "16", y2: "17" })] }));
}
export function IconChart(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("line", { x1: "4", y1: "20", x2: "20", y2: "20" }), _jsx("line", { x1: "6", y1: "16", x2: "6", y2: "20" }), _jsx("line", { x1: "12", y1: "10", x2: "12", y2: "20" }), _jsx("line", { x1: "18", y1: "6", x2: "18", y2: "20" })] }));
}
export function IconDatabase(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("ellipse", { cx: "12", cy: "5", rx: "7", ry: "3" }), _jsx("path", { d: "M5 5V12C5 13.7 8.1 15 12 15C15.9 15 19 13.7 19 12V5" }), _jsx("path", { d: "M5 12V19C5 20.7 8.1 22 12 22C15.9 22 19 20.7 19 19V12" })] }));
}
export function IconSettings(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "M12 1V5M12 19V23M5 12H1M23 12H19M4.2 4.2L7 7M17 17L19.8 19.8M4.2 19.8L7 17M17 7L19.8 4.2" })] }));
}
export function IconLogin(props) {
    return _jsx(IconHospital, { ...props });
}
export function IconPdf(props) {
    return (_jsxs(IconBase, { ...props, children: [_jsx("path", { d: "M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" }), _jsx("path", { d: "M14 2V8H20" }), _jsx("path", { d: "M12 18V12", strokeWidth: "2.5" }), _jsx("path", { d: "M9 15L12 18L15 15" })] }));
}
