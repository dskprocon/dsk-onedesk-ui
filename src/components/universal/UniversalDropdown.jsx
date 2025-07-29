// UniversalDropdown.jsx

import React from "react";
import Select from "react-select";
import { universalLabelClass } from "./UniversalStyles";

const customStyles = {
        control: (provided) => ({
                ...provided,
                border: "1px solid #9ca3af", // Tailwind gray-400
                borderRadius: "0.375rem", // rounded
                padding: "0.15rem 0.25rem",
                fontSize: "1rem",
        }),
        menu: (provided) => ({
                ...provided,
                zIndex: 9999,
        }),
};

function UniversalDropdown({ label, options, value, onChange, isMulti = false, required = false }) {
        return (
                <div className="mb-4">
                        {label && (
                                <label className={universalLabelClass}>
                                        {label}{required && <span className="text-red-500">*</span>}
                                </label>
                        )}
                        <Select
                                options={options}
                                value={value}
                                onChange={onChange}
                                isMulti={isMulti}
                                styles={customStyles}
                        />
                </div>
        );
}

export default UniversalDropdown;
