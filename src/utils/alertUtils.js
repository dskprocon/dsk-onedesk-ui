// src/utils/alertUtils.js
import Swal from "sweetalert2";

// DSK Procon Corporate Colors
const DSK_GREEN = "#2F855A";
const DSK_GRAY = "#6B7280"; // Tailwind Gray-500
const DSK_RED = "#d33";

// ✅ Success popup
export const showSuccess = (message, title = "Success") => {
    return Swal.fire({
        title,
        text: message,
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "swal2-confirm !bg-green-600 !px-4 !py-2 !rounded text-white"
        },
        buttonsStyling: false,
        backdrop: true,
    });
};

// ✅ Error popup
export const showError = (message, title = "Error") => {
    return Swal.fire({
        title,
        text: message,
        icon: "error",
        confirmButtonText: "Close",
        customClass: {
            confirmButton: "swal2-confirm !bg-red-600 !px-4 !py-2 !rounded text-white"
        },
        buttonsStyling: false,
        backdrop: true,
    });
};

// ✅ Warning popup
export const showWarning = (message, title = "Warning") => {
    return Swal.fire({
        title,
        text: message,
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "swal2-confirm !bg-yellow-500 !px-4 !py-2 !rounded text-white"
        },
        buttonsStyling: false,
        backdrop: true,
    });
};

// ✅ Confirmation dialog (with Cancel button)
export const showConfirm = async (message, title = "Are you sure?", confirmText = "Yes", cancelText = "No") => {
    const result = await Swal.fire({
        title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        customClass: {
            confirmButton: "swal2-confirm !bg-green-600 !px-4 !py-2 !rounded text-white",
            cancelButton: "swal2-cancel !bg-gray-500 !px-4 !py-2 !rounded text-white ml-2"
        },
        buttonsStyling: false,
        backdrop: true,
    });
    return result.isConfirmed;
};

// ✅ Toast Notification (Quick Alerts)
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

export const showToast = (message, type = "success") => {
    return Toast.fire({
        icon: type,
        title: message,
    });
};

// ✅ Info popup
export const showInfo = (message, title = "Information") => {
    return Swal.fire({
        title,
        text: message,
        icon: "info",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "swal2-confirm !bg-blue-600 !px-4 !py-2 !rounded text-white"
        },
        buttonsStyling: false,
        backdrop: true,
    });
};
