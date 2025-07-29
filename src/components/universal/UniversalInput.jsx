// UniversalInput.jsx

import React from "react";
import { universalInputClass, universalLabelClass } from "./UniversalStyles";

function UniversalInput({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {
        return (
                <div className="mb-4">
                        {label && (
                                <label htmlFor={name} className={universalLabelClass}>
                                        {label}{required && <span className="text-red-500">*</span>}
                                </label>
                        )}
                        <input
                                id={name}
                                name={name}
                                type={type}
                                value={value}
                                onChange={onChange}
                                placeholder={placeholder}
                                className={universalInputClass}
                                required={required}
                        />
                </div>
        );
}

export default UniversalInput;
